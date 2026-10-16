import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { skillNormalizer } from '../src/services/skillNormalizer';
import { matchingPolicyService } from '../src/services/matchingPolicy';
import { resumeClaimsService } from '../src/services/resumeClaims';
import { EvidenceRecord, SkillMatch } from '../src/types';

describe('Member 3 — Evidence Engine & Matching Tests', () => {
  // 1. Skill Normalizer & Catalogue Tests
  describe('1. Skill Normalization & Aliases', () => {
    it('normalizes known aliases to canonical skill names', () => {
      const r1 = skillNormalizer.matchSkill('ReactJS');
      const r2 = skillNormalizer.matchSkill('react.js');
      const r3 = skillNormalizer.matchSkill('react');
      expect(r1?.canonicalName).toBe('React');
      expect(r2?.canonicalName).toBe('React');
      expect(r3?.canonicalName).toBe('React');
      expect(r1?.skillId).toBe('skill-react');

      const pg = skillNormalizer.matchSkill('Postgres');
      expect(pg?.canonicalName).toBe('PostgreSQL');
      expect(pg?.skillId).toBe('skill-postgres');

      const node = skillNormalizer.matchSkill('nodejs');
      expect(node?.canonicalName).toBe('Node.js');
    });

    it('extracts skills from freeform job description text', () => {
      const text = 'Looking for a Senior Engineer with deep ReactJS, Node.js and Docker experience.';
      const extracted = skillNormalizer.extractSkillsFromText(text);
      const names = extracted.map((e) => e.canonicalName);
      expect(names).toContain('React');
      expect(names).toContain('Node.js');
      expect(names).toContain('Docker');
    });

    it('parses JD skills matching section 5 contract format', async () => {
      const res = await request(app)
        .post('/api/skills/parse-job')
        .send({
          jobId: 'job-demo-001',
          requiredSkills: ['ReactJS', 'Node.js'],
          preferredSkills: ['Postgres', 'Docker'],
        });

      expect(res.status).toBe(200);
      expect(res.body.jobId).toBe('job-demo-001');
      expect(res.body.requiredSkills[0].canonicalName).toBe('React');
      expect(res.body.preferredSkills[0].canonicalName).toBe('PostgreSQL');
      expect(res.body.needsOfficerReview).toBe(false);
    });
  });

  // 2. Pure Deterministic Matching Policy Tests
  describe('2. Deterministic Matching Policy', () => {
    const reqSkills: SkillMatch[] = [
      { skillId: 'skill-react', canonicalName: 'React', sourceText: 'React' },
      { skillId: 'skill-nodejs', canonicalName: 'Node.js', sourceText: 'Node.js' },
    ];
    const prefSkills: SkillMatch[] = [
      { skillId: 'skill-postgres', canonicalName: 'PostgreSQL', sourceText: 'PostgreSQL' },
    ];

    it('throws error when no required skills are supplied', () => {
      expect(() =>
        matchingPolicyService.calculateCandidateFit('student-001', [], prefSkills, [])
      ).toThrow('Validation error');
    });

    it('scores student-001 with high fit when evidence matches both required and preferred', () => {
      const evidences: EvidenceRecord[] = [
        {
          id: 'ev-1',
          studentId: 'student-001',
          skillId: 'skill-react',
          sourceType: 'assessment',
          title: 'React Assessment',
          score: 100,
          reviewStatus: 'ISSUER_VERIFIED',
          recordedAt: new Date().toISOString(),
          description: '',
        },
        {
          id: 'ev-2',
          studentId: 'student-001',
          skillId: 'skill-nodejs',
          sourceType: 'assessment',
          title: 'Node Assessment',
          score: 90,
          reviewStatus: 'ISSUER_VERIFIED',
          recordedAt: new Date().toISOString(),
          description: '',
        },
        {
          id: 'ev-3',
          studentId: 'student-001',
          skillId: 'skill-postgres',
          sourceType: 'project_eval',
          title: 'Postgres DB project',
          score: 90,
          reviewStatus: 'MANUALLY_REVIEWED',
          recordedAt: new Date().toISOString(),
          description: '',
        },
      ];

      const fit = matchingPolicyService.calculateCandidateFit(
        'student-001',
        reqSkills,
        prefSkills,
        evidences
      );

      expect(fit.fitScore).toBeGreaterThanOrEqual(85);
      expect(fit.matchedSkills).toContain('React');
      expect(fit.matchedSkills).toContain('Node.js');
      expect(fit.preferredMatchedSkills).toContain('PostgreSQL');
      expect(fit.noEvidenceSkills.length).toBe(0);
      expect(fit.explanation).toContain('Strong verified evidence');
      expect(fit.scoreBreakdown.requiredWeight).toBe(80);
      expect(fit.scoreBreakdown.preferredWeight).toBe(20);
    });

    it('identifies missing evidence as noEvidenceSkills without claiming false mastery', () => {
      const emptyEvidences: EvidenceRecord[] = [];
      const fit = matchingPolicyService.calculateCandidateFit(
        'student-none',
        reqSkills,
        prefSkills,
        emptyEvidences
      );

      expect(fit.fitScore).toBe(0);
      expect(fit.noEvidenceSkills).toContain('React');
      expect(fit.noEvidenceSkills).toContain('Node.js');
      expect(fit.explanation).toContain('No evidence recorded');
    });

    it('performs batch ranking reproducible ordering over 5 demo students', async () => {
      const res = await request(app)
        .post('/api/matching/batch')
        .send({
          campaignId: 'campaign-demo-001',
          requiredSkills: ['React', 'Node.js'],
          preferredSkills: ['PostgreSQL'],
          candidateStudentIds: ['student-001', 'student-002', 'student-003', 'student-004', 'student-005'],
        });

      expect(res.status).toBe(200);
      expect(res.body.campaignId).toBe('campaign-demo-001');
      expect(res.body.policyVersion).toBe('v1');
      expect(res.body.results.length).toBe(5);

      // Student 1 (Alex Chen) has React, Node, and Postgres -> should rank #1
      expect(res.body.results[0].studentId).toBe('student-001');
      expect(res.body.results[0].fitScore).toBeGreaterThan(res.body.results[4].fitScore);
    });
  });

  // 3. Truthful Resume Bullets & Upload Claim Verification
  describe('3. Truthful Resume & Claim Verification', () => {
    it('generates resume bullets only from supported records with linked evidence IDs', () => {
      const studentEvidences: EvidenceRecord[] = [
        {
          id: 'ev-test-1',
          studentId: 'student-001',
          skillId: 'skill-react',
          sourceType: 'assessment',
          title: 'React Fundamentals',
          score: 100,
          reviewStatus: 'ISSUER_VERIFIED',
          recordedAt: new Date().toISOString(),
          description: '',
        },
      ];

      const bullets = resumeClaimsService.generateTruthfulBullets(
        'student-001',
        studentEvidences
      );

      expect(bullets.length).toBe(1);
      expect(bullets[0].evidenceIds).toContain('ev-test-1');
      expect(bullets[0].text).toContain('React Fundamentals');
      expect(bullets[0].text).toContain('100%');
    });

    it('marks unevidenced claims as NEEDS_REVIEW instead of falsely flagging as CONTRADICTED', () => {
      const emptyEvidences: EvidenceRecord[] = [];
      const claim = 'Engineered high-throughput microservices using Docker and Redis';

      const verification = resumeClaimsService.verifyResumeClaim(claim, emptyEvidences);

      expect(verification.status).toBe('NEEDS_REVIEW');
      expect(verification.reason).toContain('absence of record is not proof of falsity');
    });

    it('marks claim as SUPPORTED when student has matching verified evidence', () => {
      const evidences: EvidenceRecord[] = [
        {
          id: 'ev-cert-1',
          studentId: 'student-002',
          skillId: 'skill-docker',
          sourceType: 'certificate',
          title: 'Docker Certified Associate',
          reviewStatus: 'ISSUER_VERIFIED',
          recordedAt: new Date().toISOString(),
          description: '',
        },
      ];

      const claim = 'Certified in Docker containerization workflows.';
      const verification = resumeClaimsService.verifyResumeClaim(claim, evidences);

      expect(verification.status).toBe('SUPPORTED');
      expect(verification.matchingEvidenceIds).toContain('ev-cert-1');
    });
  });

  // 4. API Endpoints Smoke Tests
  describe('4. API Endpoints', () => {
    it('GET /health returns healthy status and lists member 3 modules', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.member3Modules).toContain('matching');
    });

    it('POST /api/assessments/submit auto-grades MCQ correctly', async () => {
      const res = await request(app)
        .post('/api/assessments/submit')
        .send({
          studentId: 'student-test',
          assessmentId: 'assess-react-v1',
          answers: [1, 1, 2, 1], // all correct options
        });

      expect(res.status).toBe(200);
      expect(res.body.attempt.score).toBe(100);
      expect(res.body.attempt.passed).toBe(true);
    });

    it('POST /api/certificates records certificate with verification check', async () => {
      const res = await request(app)
        .post('/api/certificates')
        .send({
          studentId: 'student-001',
          certificateTitle: 'React Developer Credential',
          issuer: 'Credly',
          credentialId: 'CRED-9912',
          verificationUrl: 'https://www.credly.com/badges/sample-id',
        });

      expect(res.status).toBe(201);
      expect(res.body.certificate.status).toBe('ISSUER_VERIFIED');
    });
  });
});
