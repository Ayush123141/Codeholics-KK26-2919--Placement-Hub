import { Router, Request, Response } from 'express';
import { resumeClaimsService } from '../../services/resumeClaims';
import { evidenceRegistryService } from '../evidence/evidenceRouter';

export const resumesRouter = Router();

// GET /api/resumes/bullets - Retrieve truthful bullets (with optional jobId/skills)
resumesRouter.get('/bullets', (req: Request, res: Response) => {
  const studentId = (req.query.studentId as string) || 'student-001';
  const evidence = evidenceRegistryService.getStudentEvidence(studentId);
  const bullets = resumeClaimsService.generateTruthfulBullets(studentId, evidence);
  return res.json(bullets);
});

// POST /api/resumes/generate-bullets - Generate truthful bullets for candidate
resumesRouter.post('/generate-bullets', (req: Request, res: Response) => {
  const { studentId, targetSkills } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, error: 'studentId is required.' });
  }

  const evidence = evidenceRegistryService.getStudentEvidence(studentId);
  const bullets = resumeClaimsService.generateTruthfulBullets(studentId, evidence, targetSkills);

  return res.json({
    success: true,
    studentId,
    bulletsCount: bullets.length,
    bullets,
  });
});

// POST /api/resumes/review-claims & /api/resumes/claim-review - Extract claims and review against evidence
resumesRouter.post(['/review-claims', '/claim-review'], (req: Request, res: Response) => {
  const studentId = req.body.studentId || 'student-001';
  const { resumeText, claims } = req.body;

  if (!studentId) {
    return res.status(400).json({ success: false, error: 'studentId is required.' });
  }

  const evidence = evidenceRegistryService.getStudentEvidence(studentId);

  if (Array.isArray(claims) && claims.length > 0) {
    const verified = claims.map((claim: string) =>
      resumeClaimsService.verifyResumeClaim(claim, evidence)
    );
    return res.json({
      success: true,
      studentId,
      totalClaims: verified.length,
      claims: verified,
    });
  }

  if (typeof resumeText === 'string' && resumeText.trim().length > 0) {
    const reviewResult = resumeClaimsService.reviewResumeText(resumeText, evidence);
    return res.json({
      success: true,
      studentId,
      ...reviewResult,
    });
  }

  return res.status(400).json({
    success: false,
    error: 'Either "resumeText" (string) or "claims" (string array) must be provided.',
  });
});
