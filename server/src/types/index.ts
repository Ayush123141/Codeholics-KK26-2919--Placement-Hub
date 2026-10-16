export type SkillCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai_ml' | 'languages' | 'testing';

export interface CanonicalSkill {
  id: string;
  name: string;
  category: SkillCategory;
  aliases: string[];
  description?: string;
}

export interface SkillMatch {
  skillId: string;
  canonicalName: string;
  sourceText: string;
}

export interface ParsedJobSkills {
  jobId?: string;
  requiredSkills: SkillMatch[];
  preferredSkills: SkillMatch[];
  unmatchedTokens: string[];
  needsOfficerReview: boolean;
}

export type EvidenceSourceType = 'assessment' | 'github_repo' | 'project_eval' | 'certificate';

export type EvidenceReviewStatus =
  | 'EVIDENCE_FOUND'
  | 'NEEDS_REVIEW'
  | 'ISSUER_VERIFIED'
  | 'MANUALLY_REVIEWED'
  | 'UNVERIFIABLE'
  | 'CONTRADICTED'
  | 'NEEDS_REVISION'
  | 'REJECTED';

export interface EvidenceStatusHistoryItem {
  fromStatus?: EvidenceReviewStatus;
  toStatus: EvidenceReviewStatus;
  changedBy: string;
  notes?: string;
  timestamp: string;
}

export interface EvidenceRecord {
  id: string;
  studentId: string;
  skillId: string;
  sourceType: EvidenceSourceType;
  title: string;
  description: string;
  score?: number; // 0 - 100
  evidenceUrl?: string;
  reviewStatus: EvidenceReviewStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  recordedAt: string;
  statusHistory?: EvidenceStatusHistoryItem[];
  metadata?: Record<string, unknown>;
}

export interface CandidateFitScore {
  studentId: string;
  fitScore: number; // 0 - 100
  matchedSkills: string[];
  partialEvidenceSkills: string[];
  noEvidenceSkills: string[];
  preferredMatchedSkills: string[];
  preferredGapSkills: string[];
  explanation: string;
  evidenceRefs: string[];
  scoreBreakdown: {
    requiredWeight: number; // e.g. 80
    requiredScore: number;  // 0 - 100
    preferredWeight: number; // e.g. 20
    preferredScore: number; // 0 - 100
    finalWeighted: number;  // 0 - 100
  };
}

export interface BatchMatchingResponse {
  campaignId: string;
  policyVersion: string;
  totalCandidates: number;
  results: CandidateFitScore[];
}

export interface ResumeBullet {
  id: string;
  text: string;
  skillIds: string[];
  evidenceIds: string[];
}

export type ClaimVerificationStatus = 'SUPPORTED' | 'NEEDS_REVIEW' | 'CONTRADICTED';

export interface ResumeClaimVerification {
  claimText: string;
  extractedSkills: string[];
  status: ClaimVerificationStatus;
  reason: string;
  matchingEvidenceIds: string[];
}
