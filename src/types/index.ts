export type UserRole = 'STUDENT' | 'PLACEMENT_OFFICER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  college?: string;
  degree?: string;
  department?: string;
  graduationYear?: number;
  cgpa?: number;
  companyName?: string;
  headline?: string;
}

export type EvidenceStatus = 
  | 'VERIFIED' 
  | 'REVIEWED' 
  | 'NEEDS_REVIEW' 
  | 'UNVERIFIED' 
  | 'NO_EVIDENCE';

export type EvidenceType = 
  | 'ASSESSMENT' 
  | 'PROJECT' 
  | 'GITHUB' 
  | 'CERTIFICATE' 
  | 'COURSEWORK';

export interface EvidenceRecord {
  id: string;
  studentId: string;
  skillId: string;
  skillName: string;
  type: EvidenceType;
  title: string;
  sourceUrl?: string;
  status: EvidenceStatus;
  score?: string | number;
  issuer?: string;
  date: string;
  verifier?: string;
  details: string;
  evidenceRefs?: string[];
  repoFiles?: { path: string; language: string; lineRange?: string }[];
  certificateFileName?: string;
  credibilityScore?: number;
  authenticityRating?: string;
  auditMetrics?: {
    codeQuality?: number;
    commitDensity?: number;
    testCoverage?: number;
    architectureScore?: number;
    issuerTrustScore?: number;
    authenticityCheck?: string;
  };
}

export interface StudentSkill {
  id: string;
  canonicalName: string;
  category: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  evidenceCount: number;
  status: EvidenceStatus;
  evidenceIds: string[];
}

export interface StudentProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  repoUrl?: string;
  liveUrl?: string;
  evaluationScore?: number;
  evaluator?: string;
  evidenceStatus: EvidenceStatus;
}

export interface StudentExperience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

export interface StudentEducation {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  gpa: number;
}

export interface SkillRequirement {
  skillId: string;
  canonicalName: string;
  sourceText: string;
  weight: number;
  isPreferred?: boolean;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  department?: string;
  location: string;
  type: 'Full-time' | 'Internship' | 'Contract' | 'Remote';
  salaryRange: string;
  description: string;
  requiredSkills: SkillRequirement[];
  preferredSkills: SkillRequirement[];
  eligibilityCriteria: {
    minimumCgpa: number;
    allowedDepartments: string[];
    graduationYear: number[];
  };
  deadline: string;
  postedDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  sourceCount: number;
  matchedScore?: number;
  hasApplied?: boolean;
}

export type JobSourceType = 'COMPANY_POSTING' | 'ALUMNI_REFERRAL' | 'API_INGESTION';

export interface JobSource {
  id: string;
  jobId: string;
  sourceType: JobSourceType;
  sourceName: string;
  externalId?: string;
  url?: string;
  submittedBy: string;
  submittedAt: string;
  duplicateWarning: boolean;
  duplicateOfJobId?: string;
  duplicateCandidateTitle?: string;
  duplicateConfidence?: number;
  resolutionStatus?: 'PENDING' | 'APPROVED_MERGE' | 'REJECTED_SEPARATE';
  rawPayload?: Record<string, unknown>;
}

export interface MatchingResult {
  id?: string;
  applicationId?: string;
  jobId?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatarUrl?: string;
  department: string;
  cgpa: number;
  fitScore: number;
  matchedSkills: string[];
  partialEvidenceSkills: string[];
  noEvidenceSkills: string[];
  preferredGaps: string[];
  explanation: string;
  evidenceRefs: string[];
  policyVersion: string;
  isShortlisted: boolean;
  assessmentScore?: number;
  applicationStage?: ApplicationStage;
  hasOfferSecured?: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  companyName: string;
  jobId: string;
  jobTitle: string;
  salaryRange?: string;
  cohortId: string;
  cohortName: string;
  status: 'ACTIVE' | 'SHORTLISTING' | 'INTERVIEWING' | 'COMPLETED';
  startDate: string;
  deadline: string;
  targetHires: number;
  totalApplicants: number;
  shortlistedCount: number;
  interviewCount: number;
  offersCount: number;
  policyVersion: string;
}

export type ApplicationStage = 
  | 'APPLIED' 
  | 'SHORTLISTED' 
  | 'TECHNICAL_ASSESSMENT' 
  | 'INTERVIEW' 
  | 'OFFER' 
  | 'REJECTED';

export interface ApplicationEvent {
  id: string;
  applicationId: string;
  fromStage?: ApplicationStage;
  toStage: ApplicationStage;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  notes?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  studentId: string;
  studentName: string;
  appliedAt: string;
  currentStage: ApplicationStage;
  fitScore: number;
  interviewDate?: string;
  interviewNotes?: string;
  events: ApplicationEvent[];
}

export type ClaimReviewStatus = 'SUPPORTED' | 'NEEDS_REVIEW' | 'CONTRADICTED';

export interface ResumeClaim {
  id: string;
  claimText: string;
  status: ClaimReviewStatus;
  confidence: number;
  reason: string;
  evidenceRefId?: string;
  evidenceTitle?: string;
}

export interface ResumeBulletItem {
  id: string;
  text: string;
  evidenceIds: string[];
  evidenceLabels: string[];
  isVerified: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface AssessmentItem {
  id: string;
  skillId: string;
  title: string;
  version: string;
  durationMinutes: number;
  instructions: string;
  questionCount: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentAttemptResult {
  id: string;
  studentId: string;
  assessmentId: string;
  skillId: string;
  score: number;
  passed: boolean;
  completedAt: string;
}
