import { CandidateFitScore, EvidenceRecord, SkillMatch } from '../types';

export const MATCHING_POLICY_VERSION = 'v1';

export interface MatchingPolicyOptions {
  requiredWeight?: number; // default: 80
  preferredWeight?: number; // default: 20
}

/**
 * Pure, deterministic matching calculation service adhering strictly to Section 4.5 & Section 5 contracts:
 * - Requires at least one required skill; returns error otherwise.
 * - Required skills = 80%, Preferred skills = 20%.
 * - If no preferred skills in JD, required skills weight = 100%.
 * - Evidence strength calculated per skill from verified assessments, project evaluations, GitHub findings, and certificates.
 * - Explanations link directly to matched skills, partial skills, and missing evidence gaps.
 * - Describes score as job fit under a documented policy, never as hiring probability.
 */
export class MatchingPolicyService {
  public calculateCandidateFit(
    studentId: string,
    requiredSkills: SkillMatch[],
    preferredSkills: SkillMatch[],
    studentEvidence: EvidenceRecord[],
    options?: MatchingPolicyOptions
  ): CandidateFitScore {
    if (!requiredSkills || requiredSkills.length === 0) {
      throw new Error('Validation error: Job must have at least one required skill for matching.');
    }

    const hasPreferred = preferredSkills && preferredSkills.length > 0;
    const reqWeight = hasPreferred ? (options?.requiredWeight ?? 80) : 100;
    const prefWeight = hasPreferred ? (options?.preferredWeight ?? 20) : 0;

    const matchedSkills: string[] = [];
    const partialEvidenceSkills: string[] = [];
    const noEvidenceSkills: string[] = [];
    const preferredMatchedSkills: string[] = [];
    const preferredGapSkills: string[] = [];
    const evidenceRefs: string[] = [];

    // 1. Evaluate Required Skills
    let requiredScoreSum = 0;
    for (const reqSkill of requiredSkills) {
      const evidences = studentEvidence.filter(
        (e) => e.skillId.toLowerCase() === reqSkill.skillId.toLowerCase()
      );

      const skillScore = this.evaluateSkillEvidenceScore(evidences);
      requiredScoreSum += skillScore;

      evidences.forEach((e) => {
        if (!evidenceRefs.includes(e.id)) {
          evidenceRefs.push(e.id);
        }
      });

      if (skillScore >= 70) {
        matchedSkills.push(reqSkill.canonicalName);
      } else if (skillScore > 0) {
        partialEvidenceSkills.push(reqSkill.canonicalName);
      } else {
        noEvidenceSkills.push(reqSkill.canonicalName);
      }
    }

    const requiredAverage = Math.round(requiredScoreSum / requiredSkills.length);

    // 2. Evaluate Preferred Skills
    let preferredAverage = 0;
    if (hasPreferred) {
      let preferredScoreSum = 0;
      for (const prefSkill of preferredSkills) {
        const evidences = studentEvidence.filter(
          (e) => e.skillId.toLowerCase() === prefSkill.skillId.toLowerCase()
        );

        const skillScore = this.evaluateSkillEvidenceScore(evidences);
        preferredScoreSum += skillScore;

        evidences.forEach((e) => {
          if (!evidenceRefs.includes(e.id)) {
            evidenceRefs.push(e.id);
          }
        });

        if (skillScore >= 60) {
          preferredMatchedSkills.push(prefSkill.canonicalName);
        } else {
          preferredGapSkills.push(prefSkill.canonicalName);
        }
      }
      preferredAverage = Math.round(preferredScoreSum / preferredSkills.length);
    }

    // 3. Compute Weighted Fit Score (0 - 100)
    const finalScore = Math.min(
      100,
      Math.max(
        0,
        Math.round((requiredAverage * reqWeight + preferredAverage * prefWeight) / 100)
      )
    );

    // 4. Generate Clear, Deterministic Explanation
    const explanation = this.generateExplanation({
      matchedSkills,
      partialEvidenceSkills,
      noEvidenceSkills,
      preferredMatchedSkills,
      preferredGapSkills,
    });

    return {
      studentId,
      fitScore: finalScore,
      matchedSkills,
      partialEvidenceSkills,
      noEvidenceSkills,
      preferredMatchedSkills,
      preferredGapSkills,
      explanation,
      evidenceRefs,
      scoreBreakdown: {
        requiredWeight: reqWeight,
        requiredScore: requiredAverage,
        preferredWeight: prefWeight,
        preferredScore: preferredAverage,
        finalWeighted: finalScore,
      },
    };
  }

  /**
   * Deterministically score evidence for a single skill based on verification status & source
   */
  public evaluateSkillEvidenceScore(evidences: EvidenceRecord[]): number {
    if (!evidences || evidences.length === 0) return 0;

    let highestScore = 0;

    for (const ev of evidences) {
      let score = 0;

      // Base weight by source
      if (ev.sourceType === 'assessment') {
        score = ev.score !== undefined ? ev.score : 80;
      } else if (ev.sourceType === 'project_eval') {
        score = ev.score !== undefined ? ev.score : 85;
      } else if (ev.sourceType === 'github_repo') {
        score = ev.reviewStatus === 'EVIDENCE_FOUND' ? 75 : 60;
      } else if (ev.sourceType === 'certificate') {
        if (ev.reviewStatus === 'ISSUER_VERIFIED') {
          score = 80;
        } else if (ev.reviewStatus === 'MANUALLY_REVIEWED') {
          score = 75;
        } else {
          score = 50; // Needs review
        }
      }

      // Modifier for verified status
      if (ev.reviewStatus === 'CONTRADICTED' || ev.reviewStatus === 'UNVERIFIABLE') {
        score = 0;
      }

      if (score > highestScore) {
        highestScore = score;
      }
    }

    return Math.min(100, highestScore);
  }

  private generateExplanation(breakdown: {
    matchedSkills: string[];
    partialEvidenceSkills: string[];
    noEvidenceSkills: string[];
    preferredMatchedSkills: string[];
    preferredGapSkills: string[];
  }): string {
    const parts: string[] = [];

    if (breakdown.matchedSkills.length > 0) {
      parts.push(`Strong verified evidence for ${breakdown.matchedSkills.join(', ')}.`);
    }

    if (breakdown.partialEvidenceSkills.length > 0) {
      parts.push(
        `Partial or pending evidence for ${breakdown.partialEvidenceSkills.join(', ')}.`
      );
    }

    if (breakdown.noEvidenceSkills.length > 0) {
      parts.push(
        `No evidence recorded for required skill(s): ${breakdown.noEvidenceSkills.join(', ')}.`
      );
    }

    if (breakdown.preferredMatchedSkills.length > 0) {
      parts.push(`Bonus match on preferred: ${breakdown.preferredMatchedSkills.join(', ')}.`);
    }

    if (breakdown.preferredGapSkills.length > 0) {
      parts.push(`Preferred gaps: ${breakdown.preferredGapSkills.join(', ')}.`);
    }

    return parts.join(' ');
  }
}

export const matchingPolicyService = new MatchingPolicyService();
