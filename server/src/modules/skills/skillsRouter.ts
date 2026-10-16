import { Router, Request, Response } from 'express';
import { skillNormalizer } from '../../services/skillNormalizer';
import { getAllCanonicalSkills, getCanonicalSkillById } from './skillCatalogue';

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

// POST /api/skills/parse-job - Parse JD skills matching Section 5 contract
skillsRouter.post('/parse-job', (req: Request, res: Response) => {
  const { jobId, requiredSkills, preferredSkills, jdText } = req.body;

  let parsed;
  if (Array.isArray(requiredSkills) || Array.isArray(preferredSkills)) {
    parsed = skillNormalizer.parseJobSkills({
      jobId,
      requiredList: requiredSkills,
      preferredList: preferredSkills,
    });
  } else if (typeof jdText === 'string') {
    parsed = skillNormalizer.parseJobSkills({
      jobId,
      requiredText: jdText,
    });
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
