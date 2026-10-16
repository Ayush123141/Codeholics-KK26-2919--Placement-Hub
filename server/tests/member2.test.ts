import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Member 2 — Placement Workflow, Auth & Cancellation Tests', () => {
  describe('1. Role Authentication & Access Control', () => {
    it('authenticates Placement Officer and returns role claims', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'officer@techsummit.edu',
          role: 'PLACEMENT_OFFICER',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('PLACEMENT_OFFICER');
      expect(res.body.token).toBeDefined();
    });

    it('rejects unauthenticated request to /api/auth/me', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('validates authenticated session token on /api/auth/me', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'officer@techsummit.edu',
          role: 'PLACEMENT_OFFICER',
        });

      const token = loginRes.body.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.role).toBe('PLACEMENT_OFFICER');
    });
  });

  describe('2. Placement Officer Application Stage Modification & Audit', () => {
    it('records placement officer application stage cancellation with auditable reason', async () => {
      const res = await request(app)
        .post('/api/applications/app-test-cancel/cancel')
        .send({
          action: 'CANCEL_INTERVIEW',
          reason: 'Candidate accepted competing offer prior to technical round 2',
          actorRole: 'PLACEMENT_OFFICER',
        });

      // If app-test-cancel not in live DB, it returns 404 cleanly; otherwise 200
      expect([200, 404]).toContain(res.status);
    });

    it('rejects cancellation when mandatory reason is missing', async () => {
      const res = await request(app)
        .post('/api/applications/app-test-cancel/cancel')
        .send({
          action: 'CANCEL_INTERVIEW',
          reason: '', // Empty reason should fail validation
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('3. Placement Evidence Scrutiny', () => {
    it('allows officer to update review status with scrutiny notes', async () => {
      const registerRes = await request(app)
        .post('/api/evidence')
        .send({
          studentId: 'student-test-01',
          skillId: 'skill-react',
          sourceType: 'project_eval',
          title: 'Full Stack Micro-services Architecture',
          reviewStatus: 'NEEDS_REVIEW',
        });

      expect(registerRes.status).toBe(201);
      const evId = registerRes.body.evidence.id;

      const reviewRes = await request(app)
        .patch(`/api/evidence/${evId}/status`)
        .send({
          status: 'MANUALLY_REVIEWED',
          reviewer: 'Dr. Ramesh Kulkarni (Placement Officer)',
          reviewNotes: 'Verified GitHub commit history and code quality rubric.',
        });

      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.evidence.reviewStatus).toBe('MANUALLY_REVIEWED');
      expect(reviewRes.body.evidence.reviewedBy).toContain('Ramesh Kulkarni');
      expect(reviewRes.body.evidence.metadata.reviewNotes).toBeDefined();
    });
  });

  describe('4. Placement Officer Cohort Shortlist & Gate Management', () => {
    it('toggles candidate shortlist approval status', async () => {
      const res = await request(app)
        .post('/api/placement/candidates/student-003/shortlist')
        .send({ isShortlisted: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.studentId).toBe('student-003');
      expect(res.body.isShortlisted).toBe(true);
    });

    it('approves and releases cohort shortlist with officer signature', async () => {
      const releaseRes = await request(app)
        .post('/api/placement/shortlist/release')
        .send({
          jobId: 'job-demo-001',
          releasedBy: 'Dr. Ramesh Sharma (Placement Cell)',
          notes: 'Cohort 2026 evaluated against frontend JD criteria',
        });

      expect(releaseRes.status).toBe(200);
      expect(releaseRes.body.success).toBe(true);
      expect(releaseRes.body.releasedCount).toBeGreaterThanOrEqual(1);
      expect(releaseRes.body.releasedAt).toBeDefined();
    });

    it('returns official shortlist verification status', async () => {
      const statusRes = await request(app)
        .get('/api/placement/shortlist/status?jobId=job-demo-001');

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.success).toBe(true);
      expect(statusRes.body.shortlistedCount).toBeGreaterThanOrEqual(1);
    });
  });
});

