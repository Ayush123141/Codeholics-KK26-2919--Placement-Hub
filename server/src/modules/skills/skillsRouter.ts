import { Router, Request, Response } from 'express';
import { skillNormalizer } from '../../services/skillNormalizer';
import { llmAssistService } from '../../services/llmAssist';
import { getAllCanonicalSkills, getCanonicalSkillById } from './skillCatalogue';
import { evidenceRegistryService } from '../evidence/evidenceRouter';

export const skillsRouter = Router();

// GET /api/skills - List all canonical skills
skillsRouter.get('/', (_req: Request, res: Response) => {
  const skills = getAllCanonicalSkills();
  res.json({
    success: true,
    count: skills.length,
    skills,
  });
});

// GET /api/skills/:id - Get specific skill details
skillsRouter.get('/:id', (req: Request, res: Response) => {
  const skill = getCanonicalSkillById(req.params.id);
  if (!skill) {
    return res.status(404).json({
      success: false,
      error: `Skill with id '${req.params.id}' not found`,
    });
  }
  return res.json({ success: true, skill });
});

// GET /api/skills/student/:studentId/structured-evidence - Feature D: Structured evidence breakdown for matching & resumes
skillsRouter.get('/student/:studentId/structured-evidence', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const canonicalSkills = getAllCanonicalSkills();
  const allEvidences = evidenceRegistryService.getStudentEvidence(studentId);

  const breakdown = canonicalSkills.map((skill) => {
    const evidences = allEvidences.filter(
      (e) => e.skillId.toLowerCase() === skill.id.toLowerCase()
    );

    const assessmentDerived = evidences.filter(
      (e) => e.sourceType === 'assessment' && (e.reviewStatus === 'ISSUER_VERIFIED' || (e.score && e.score >= 70))
    );
    const reviewerVerified = evidences.filter(
      (e) => (e.sourceType === 'project_eval' || e.sourceType === 'certificate') && (e.reviewStatus === 'MANUALLY_REVIEWED' || e.reviewStatus === 'ISSUER_VERIFIED')
    );
    const pendingOrReview = evidences.filter(
      (e) => e.reviewStatus === 'NEEDS_REVIEW' || e.reviewStatus === 'NEEDS_REVISION'
    );
    const unverifiedOrContradicted = evidences.filter(
      (e) => e.reviewStatus === 'UNVERIFIABLE' || e.reviewStatus === 'CONTRADICTED' || e.reviewStatus === 'REJECTED'
    );

    let statusCategory: 'ASSESSMENT_VERIFIED' | 'REVIEWER_VERIFIED' | 'PENDING_REVIEW' | 'UNVERIFIED' | 'NO_EVIDENCE' = 'NO_EVIDENCE';
    if (assessmentDerived.length > 0) {
      statusCategory = 'ASSESSMENT_VERIFIED';
    } else if (reviewerVerified.length > 0) {
      statusCategory = 'REVIEWER_VERIFIED';
    } else if (pendingOrReview.length > 0) {
      statusCategory = 'PENDING_REVIEW';
    } else if (unverifiedOrContradicted.length > 0) {
      statusCategory = 'UNVERIFIED';
    }

    return {
      skillId: skill.id,
      canonicalName: skill.name,
      category: skill.category,
      statusCategory,
      totalEvidenceCount: evidences.length,
      assessmentDerivedCount: assessmentDerived.length,
      reviewerVerifiedCount: reviewerVerified.length,
      pendingCount: pendingOrReview.length,
      unverifiedCount: unverifiedOrContradicted.length,
      evidences,
    };
  });

  return res.json({
    success: true,
    studentId,
    totalSkillsScored: breakdown.filter((b) => b.totalEvidenceCount > 0).length,
    skills: breakdown,
  });
});

// POST /api/skills/normalize - Normalize a list of raw tokens or text
skillsRouter.post('/normalize', (req: Request, res: Response) => {
  const { tokens, text } = req.body;

  if (Array.isArray(tokens)) {
    const matches = tokens.map((token: string) => ({
      input: token,
      match: skillNormalizer.matchSkill(token),
    }));
    return res.json({ success: true, matches });
  }

  if (typeof text === 'string') {
    const extracted = skillNormalizer.extractSkillsFromText(text);
    return res.json({ success: true, extracted });
  }

  return res.status(400).json({
    success: false,
    error: 'Provide either "tokens" (string array) or "text" (string) to normalize.',
  });
});

// POST /api/skills/parse-job - Parse JD skills matching Section 5 contract (with LLM assist + catalog validation)
skillsRouter.post('/parse-job', async (req: Request, res: Response) => {
  const { jobId, requiredSkills, preferredSkills, jdText } = req.body;

  let parsed;
  if (Array.isArray(requiredSkills) || Array.isArray(preferredSkills)) {
    parsed = skillNormalizer.parseJobSkills({
      jobId,
      requiredList: requiredSkills,
      preferredList: preferredSkills,
    });
  } else if (typeof jdText === 'string') {
    parsed = await llmAssistService.parseJobDescriptionWithLLM(jdText, jobId);
  } else {
    return res.status(400).json({
      success: false,
      error: 'Invalid input. Please provide requiredSkills/preferredSkills arrays or jdText string.',
    });
  }

  // Exact contract from section 5
  return res.json({
    jobId: parsed.jobId || 'job-preview',
    requiredSkills: parsed.requiredSkills,
    preferredSkills: parsed.preferredSkills,
    unmatchedTokens: parsed.unmatchedTokens,
    needsOfficerReview: parsed.needsOfficerReview,
  });
});
