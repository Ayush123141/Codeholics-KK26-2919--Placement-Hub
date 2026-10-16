import { Router, Request, Response } from 'express';
import { matchingPolicyService, MATCHING_POLICY_VERSION } from '../../services/matchingPolicy';
import { skillNormalizer } from '../../services/skillNormalizer';
import { evidenceRegistryService } from '../evidence/evidenceRouter';
import { BatchMatchingResponse, CandidateFitScore, SkillMatch } from '../../types';

export const matchingRouter = Router();

// POST /api/matching/batch - Batch ranking for a campaign / job against candidates
matchingRouter.post('/batch', (req: Request, res: Response) => {
  const { campaignId, requiredSkills, preferredSkills, candidateStudentIds, jdText } = req.body;

  let reqSkills: SkillMatch[] = [];
  let prefSkills: SkillMatch[] = [];

  if (Array.isArray(requiredSkills)) {
    reqSkills = requiredSkills.map((s: string | SkillMatch) =>
      typeof s === 'string'
        ? skillNormalizer.matchSkill(s) || {
            skillId: `skill-${s.toLowerCase().replace(/\s+/g, '-')}`,
            canonicalName: s,
            sourceText: s,
          }
        : s
    );
  }

  if (Array.isArray(preferredSkills)) {
    prefSkills = preferredSkills.map((s: string | SkillMatch) =>
      typeof s === 'string'
        ? skillNormalizer.matchSkill(s) || {
            skillId: `skill-${s.toLowerCase().replace(/\s+/g, '-')}`,
            canonicalName: s,
            sourceText: s,
          }
        : s
    );
  }

  // Parse from jdText if requiredSkills not directly supplied
  if (reqSkills.length === 0 && jdText) {
    const parsed = skillNormalizer.parseJobSkills({ requiredText: jdText });
    reqSkills = parsed.requiredSkills;
    prefSkills = parsed.preferredSkills;
  }

  if (reqSkills.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation error: At least one required skill must be specified or extracted for matching.',
    });
  }

  const studentIds: string[] = Array.isArray(candidateStudentIds) && candidateStudentIds.length > 0
    ? candidateStudentIds
    : ['student-001', 'student-002', 'student-003', 'student-004', 'student-005'];

  const results: CandidateFitScore[] = [];

  for (const sId of studentIds) {
    const evidences = evidenceRegistryService.getStudentEvidence(sId);
    try {
      const fit = matchingPolicyService.calculateCandidateFit(
        sId,
        reqSkills,
        prefSkills,
        evidences
      );
      results.push(fit);
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  // Sort descending by fitScore
  results.sort((a, b) => b.fitScore - a.fitScore);

  const response: BatchMatchingResponse = {
    campaignId: campaignId || 'campaign-demo-001',
    policyVersion: MATCHING_POLICY_VERSION,
    totalCandidates: results.length,
    results,
  };

  return res.json(response);
});

// POST /api/matching/single - Match a single candidate against a JD
matchingRouter.post('/single', (req: Request, res: Response) => {
  const { studentId, requiredSkills, preferredSkills } = req.body;

  if (!studentId || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'studentId and a non-empty requiredSkills array are required.',
    });
  }

  const reqSkills: SkillMatch[] = requiredSkills.map((s: string | SkillMatch) =>
    typeof s === 'string'
      ? skillNormalizer.matchSkill(s) || {
          skillId: `skill-${s.toLowerCase()}`,
          canonicalName: s,
          sourceText: s,
        }
      : s
  );

  const prefSkills: SkillMatch[] = Array.isArray(preferredSkills)
    ? preferredSkills.map((s: string | SkillMatch) =>
        typeof s === 'string'
          ? skillNormalizer.matchSkill(s) || {
              skillId: `skill-${s.toLowerCase()}`,
              canonicalName: s,
              sourceText: s,
            }
          : s
      )
    : [];

  const evidences = evidenceRegistryService.getStudentEvidence(studentId);
  try {
    const fit = matchingPolicyService.calculateCandidateFit(
      studentId,
      reqSkills,
      prefSkills,
      evidences
    );
    return res.json({
      success: true,
      policyVersion: MATCHING_POLICY_VERSION,
      result: fit,
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});
