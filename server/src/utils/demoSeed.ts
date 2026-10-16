import { evidenceRegistryService } from '../modules/evidence/evidenceRouter';
import { certificatesStore } from '../modules/certificates/certificatesRouter';
import { assessmentAttemptsStore } from '../modules/assessments/assessmentsRouter';

/**
 * Seeds the 5 diverse demo students required by Section 8 of TEAM_TASK_BREAKDOWN.md:
 * - student-001: Alex Chen (Strong full-stack: React 95, Node 90, Postgres 85)
 * - student-002: Priya Sharma (Strong frontend & React: React 90, Docker 80, Postgres: None)
 * - student-003: Marcus Johnson (Backend & DB specialist: Node 85, Postgres 90, Docker 85, React: None)
 * - student-004: Sofia Rodriguez (Partial evidence: React 60, Node 55, Postgres 40 - needs review)
 * - student-005: Kevin Patel (Entry-level / Minimal evidence: Git only, missing React & Postgres)
 */
export function seedDemoEvidence(): void {
  // Clear any previous for idempotency
  if (evidenceRegistryService.getStudentEvidence('student-001').length > 0) return;

  // --- Student 1: Alex Chen ---
  evidenceRegistryService.registerEvidence({
    studentId: 'student-001',
    skillId: 'skill-react',
    sourceType: 'assessment',
    title: 'React Fundamentals MCQ Assessment v1',
    description: 'Scored 100% on React component architecture and reconciliation.',
    score: 100,
    reviewStatus: 'ISSUER_VERIFIED',
  });
  evidenceRegistryService.registerEvidence({
    studentId: 'student-001',
    skillId: 'skill-react',
    sourceType: 'project_eval',
    title: 'Placement Hub Student Portal',
    description: 'Evaluated by Prof. Miller; rubric score 95/100.',
    score: 95,
    reviewStatus: 'MANUALLY_REVIEWED',
  });
  evidenceRegistryService.registerEvidence({
    studentId: 'student-001',
    skillId: 'skill-nodejs',
    sourceType: 'assessment',
    title: 'Node.js Core Architecture v1',
    description: 'Passed Node.js async I/O assessment.',
    score: 90,
    reviewStatus: 'ISSUER_VERIFIED',
  });
  evidenceRegistryService.registerEvidence({
    studentId: 'student-001',
    skillId: 'skill-postgres',
    sourceType: 'project_eval',
    title: 'Relational Schema & Query Optimization Project',
    description: 'Database indexing and migration architecture project.',
    score: 88,
    reviewStatus: 'MANUALLY_REVIEWED',
  });

  // --- Student 2: Priya Sharma ---
  evidenceRegistryService.registerEvidence({
    studentId: 'student-002',
    skillId: 'skill-react',
    sourceType: 'assessment',
    title: 'React Fundamentals MCQ Assessment v1',
    description: 'Scored 92% on React hooks and state management.',
    score: 92,
    reviewStatus: 'ISSUER_VERIFIED',
  });
  evidenceRegistryService.registerEvidence({
    studentId: 'student-002',
    skillId: 'skill-react',
    sourceType: 'github_repo',
    title: 'github.com/priyasharma/react-analytics-dashboard',
    description: 'Public repository with production React components.',
    score: 85,
    reviewStatus: 'EVIDENCE_FOUND',
  });
  evidenceRegistryService.registerEvidence({
    studentId: 'student-002',
    skillId: 'skill-docker',
    sourceType: 'certificate',
    title: 'Docker Certified Associate',
    description: 'Credly issuer verified credential ID: DCA-88419.',
    score: 85,
    reviewStatus: 'ISSUER_VERIFIED',
  });

  // --- Student 3: Marcus Johnson ---
  evidenceRegistryService.registerEvidence({
    studentId: 'student-003',
    skillId: 'skill-nodejs',
    sourceType: 'assessment',
    title: 'Node.js Core Architecture v1',
    description: 'Scored 85% on streams and event loop.',
    score: 85,
    reviewStatus: 'ISSUER_VERIFIED',
  });
  evidenceRegistryService.registerEvidence({
    studentId: 'student-003',
    skillId: 'skill-postgres',
    sourceType: 'assessment',
    title: 'PostgreSQL Relational Design v1',
    description: 'Scored 90% on indexing and execution planning.',
    score: 90,
    reviewStatus: 'ISSUER_VERIFIED',
  });
  evidenceRegistryService.registerEvidence({
    studentId: 'student-003',
    skillId: 'skill-docker',
    sourceType: 'project_eval',
    title: 'Microservices Deployment & Dockerization',
    description: 'Containerized multi-service deployment rubric score 88.',
    score: 88,
    reviewStatus: 'MANUALLY_REVIEWED',
  });

  // --- Student 4: Sofia Rodriguez ---
  evidenceRegistryService.registerEvidence({
    studentId: 'student-004',
    skillId: 'skill-react',
    sourceType: 'assessment',
    title: 'React Fundamentals MCQ Assessment v1',
    description: 'Attempted assessment; score 60%.',
    score: 60,
    reviewStatus: 'NEEDS_REVIEW',
  });
  evidenceRegistryService.registerEvidence({
    studentId: 'student-004',
    skillId: 'skill-nodejs',
    sourceType: 'certificate',
    title: 'Node.js Bootcamp Completion Certificate',
    description: 'Unverified PDF certificate uploaded without online verification URL.',
    score: 55,
    reviewStatus: 'NEEDS_REVIEW',
  });

  // --- Student 5: Kevin Patel ---
  evidenceRegistryService.registerEvidence({
    studentId: 'student-005',
    skillId: 'skill-git',
    sourceType: 'github_repo',
    title: 'github.com/kevinpatel/portfolio',
    description: 'Simple static portfolio website.',
    score: 70,
    reviewStatus: 'EVIDENCE_FOUND',
  });
}
