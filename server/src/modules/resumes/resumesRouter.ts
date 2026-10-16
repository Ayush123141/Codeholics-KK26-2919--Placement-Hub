import { Router, Request, Response } from 'express';
import { resumeClaimsService } from '../../services/resumeClaims';
import { evidenceRegistryService } from '../evidence/evidenceRouter';

export const resumesRouter = Router();

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

// POST /api/resumes/review-claims - Extract claims from uploaded resume text & review against evidence
resumesRouter.post('/review-claims', (req: Request, res: Response) => {
  const { studentId, resumeText, claims } = req.body;

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
