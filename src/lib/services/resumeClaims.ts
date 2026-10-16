import { skillNormalizer } from './skillNormalizer';

export interface ResumeBullet {
  id: string;
  text: string;
  skillIds: string[];
  evidenceIds: string[];
}

export interface ResumeClaimVerification {
  claimText: string;
  extractedSkills: string[];
  status: 'SUPPORTED' | 'NEEDS_REVIEW' | 'CONTRADICTED';
  reason: string;
  matchingEvidenceIds: string[];
}

export interface EvidenceRecordItem {
  id: string;
  skillId: string;
  title: string;
  sourceType?: string;
  reviewStatus?: string;
  score?: number;
  description?: string;
}

export class ResumeClaimsService {
  public generateTruthfulBullets(
    _studentId: string,
    evidenceRecords: EvidenceRecordItem[],
    targetSkills?: string[]
  ): ResumeBullet[] {
    const bullets: ResumeBullet[] = [];

    const targetSet = targetSkills ? new Set(targetSkills.map((s) => s.toLowerCase())) : null;
    const applicableEvidence = targetSet
      ? evidenceRecords.filter((e) => targetSet.has(e.skillId.toLowerCase()))
      : evidenceRecords;

    for (const ev of applicableEvidence) {
      if (ev.sourceType === 'assessment' && (ev.score || 0) >= 70) {
        bullets.push({
          id: `bullet-${ev.id}`,
          text: `Demonstrated verified proficiency in ${ev.title} achieving top-tier score of ${ev.score}% in automated technical assessment.`,
          skillIds: [ev.skillId],
          evidenceIds: [ev.id],
        });
      } else if (ev.sourceType === 'project_eval' && (ev.score || 0) >= 70) {
        bullets.push({
          id: `bullet-${ev.id}`,
          text: `Architected and engineered ${ev.title}; evaluated across architecture and code quality rubric with an overall evaluation score of ${ev.score}/100.`,
          skillIds: [ev.skillId],
          evidenceIds: [ev.id],
        });
      } else if (ev.sourceType === 'github_repo' && ev.reviewStatus === 'EVIDENCE_FOUND') {
        bullets.push({
          id: `bullet-${ev.id}`,
          text: `Developed and contributed to public repository ${ev.title} with inspected manifests and active technical implementation.`,
          skillIds: [ev.skillId],
          evidenceIds: [ev.id],
        });
      } else if (ev.sourceType === 'certificate' && ev.reviewStatus === 'ISSUER_VERIFIED') {
        bullets.push({
          id: `bullet-${ev.id}`,
          text: `Earned issuer-verified credential: ${ev.title} (${ev.description || 'Verified via credential ID'}).`,
          skillIds: [ev.skillId],
          evidenceIds: [ev.id],
        });
      }
    }

    return bullets;
  }

  public verifyResumeClaim(
    claimText: string,
    studentEvidence: EvidenceRecordItem[]
  ): ResumeClaimVerification {
    const extracted = skillNormalizer.extractSkillsFromText(claimText);
    const extractedSkillIds = extracted.map((e) => e.skillId);

    if (extractedSkillIds.length === 0) {
      return {
        claimText,
        extractedSkills: [],
        status: 'NEEDS_REVIEW',
        reason: 'General experience claim. No specific canonical technical skill recognized; needs manual officer review.',
        matchingEvidenceIds: [],
      };
    }

    const matchingEvidence: EvidenceRecordItem[] = [];
    let hasContradiction = false;
    let contradictionReason = '';

    for (const sId of extractedSkillIds) {
      const records = studentEvidence.filter(
        (e) => e.skillId.toLowerCase() === sId.toLowerCase()
      );

      for (const rec of records) {
        matchingEvidence.push(rec);
        if (rec.reviewStatus === 'CONTRADICTED' || rec.reviewStatus === 'UNVERIFIABLE') {
          hasContradiction = true;
          contradictionReason = `Claimed credential or skill refuted by verification record ${rec.id}: ${rec.description || 'Verification failed.'}`;
        }
      }
    }

    if (hasContradiction) {
      return {
        claimText,
        extractedSkills: extracted.map((e) => e.canonicalName),
        status: 'CONTRADICTED',
        reason: contradictionReason,
        matchingEvidenceIds: matchingEvidence.map((e) => e.id),
      };
    }

    const verifiedRecords = matchingEvidence.filter(
      (e) =>
        e.reviewStatus === 'ISSUER_VERIFIED' ||
        e.reviewStatus === 'MANUALLY_REVIEWED' ||
        e.reviewStatus === 'EVIDENCE_FOUND' ||
        (e.sourceType === 'assessment' && (e.score || 0) >= 70)
    );

    if (verifiedRecords.length > 0) {
      return {
        claimText,
        extractedSkills: extracted.map((e) => e.canonicalName),
        status: 'SUPPORTED',
        reason: `Claim is supported by ${verifiedRecords.length} recorded verified evidence artifact(s).`,
        matchingEvidenceIds: verifiedRecords.map((e) => e.id),
      };
    }

    return {
      claimText,
      extractedSkills: extracted.map((e) => e.canonicalName),
      status: 'NEEDS_REVIEW',
      reason:
        'No verified evidence currently recorded for this claim. Marked for officer review (absence of record is not proof of falsity).',
      matchingEvidenceIds: [],
    };
  }

  public reviewResumeText(
    resumeText: string,
    studentEvidence: EvidenceRecordItem[]
  ): {
    totalClaims: number;
    supportedCount: number;
    needsReviewCount: number;
    contradictedCount: number;
    claims: ResumeClaimVerification[];
  } {
    const rawLines = resumeText
      .split(/[\r\n]+|[•\-\*]\s+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 15);

    const verifiedClaims = rawLines.map((line) =>
      this.verifyResumeClaim(line, studentEvidence)
    );

    const supportedCount = verifiedClaims.filter((c) => c.status === 'SUPPORTED').length;
    const needsReviewCount = verifiedClaims.filter((c) => c.status === 'NEEDS_REVIEW').length;
    const contradictedCount = verifiedClaims.filter((c) => c.status === 'CONTRADICTED').length;

    return {
      totalClaims: verifiedClaims.length,
      supportedCount,
      needsReviewCount,
      contradictedCount,
      claims: verifiedClaims,
    };
  }
}

export const resumeClaimsService = new ResumeClaimsService();
