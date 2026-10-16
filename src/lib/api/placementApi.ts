import { request } from './client';
import { 
  DEMO_CAMPAIGNS, 
  DEMO_JOB_SOURCES, 
  DEMO_BATCH_RANKING, 
  DEMO_APPLICATIONS 
} from './demoData';
import { 
  Campaign, 
  JobSource, 
  MatchingResult, 
  Application, 
  ApplicationStage 
} from '@/types';

let localCampaigns: Campaign[] = [...DEMO_CAMPAIGNS];
let localSources: JobSource[] = [...DEMO_JOB_SOURCES];
let localRanking: MatchingResult[] = [...DEMO_BATCH_RANKING];
let localApplications: Application[] = [...DEMO_APPLICATIONS];

export const placementApi = {
  async getMetrics() {
    return {
      activeCampaigns: localCampaigns.length,
      availableVacancies: 6,
      cohortSize: 240,
      assessmentCompletionRate: '87.5%',
      evidenceReviewsPending: localSources.filter(s => s.resolutionStatus === 'PENDING').length + 2,
      shortlistedCount: localRanking.filter(r => r.isShortlisted).length,
      applicationsByStage: {
        applied: 18,
        shortlisted: 6,
        technicalAssessment: 4,
        interview: 3,
        offer: 1,
        rejected: 2,
      },
    };
  },

  async getCampaigns(): Promise<Campaign[]> {
    try {
      return await request<Campaign[]>('/api/placement/campaigns');
    } catch {
      return localCampaigns;
    }
  },

  async createCampaign(newCampaign: Omit<Campaign, 'id' | 'shortlistedCount' | 'interviewCount' | 'offersCount' | 'totalApplicants'>): Promise<Campaign> {
    try {
      return await request<Campaign>('/api/placement/campaigns', {
        method: 'POST',
        body: JSON.stringify(newCampaign),
      });
    } catch {
      const created: Campaign = {
        ...newCampaign,
        id: `campaign-${Date.now()}`,
        shortlistedCount: 0,
        interviewCount: 0,
        offersCount: 0,
        totalApplicants: 0,
      };
      localCampaigns = [created, ...localCampaigns];
      return created;
    }
  },

  async getJobSources(): Promise<JobSource[]> {
    try {
      return await request<JobSource[]>('/api/placement/jobs/sources');
    } catch {
      return localSources;
    }
  },

  async resolveDuplicate(sourceId: string, resolution: 'APPROVED_MERGE' | 'REJECTED_SEPARATE'): Promise<JobSource> {
    try {
      return await request<JobSource>(`/api/placement/jobs/sources/${sourceId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution }),
      });
    } catch {
      const src = localSources.find(s => s.id === sourceId);
      if (!src) throw new Error('Job source not found');
      src.resolutionStatus = resolution;
      src.duplicateWarning = false;
      return src;
    }
  },

  async runBatchRanking(jobId: string, campaignId?: string): Promise<{
    policyVersion: string;
    jobId: string;
    campaignId?: string;
    results: MatchingResult[];
  }> {
    try {
      return await request(`/api/matching/batch-rank`, {
        method: 'POST',
        body: JSON.stringify({ jobId, campaignId }),
      });
    } catch {
      return {
        policyVersion: 'v1.0-deterministic-80-20',
        jobId,
        campaignId,
        results: localRanking,
      };
    }
  },

  async toggleCandidateShortlist(studentId: string): Promise<boolean> {
    try {
      const res = await request<{ isShortlisted: boolean }>(`/api/placement/candidates/${studentId}/shortlist`, {
        method: 'POST',
      });
      return res.isShortlisted;
    } catch {
      const candidate = localRanking.find(r => r.studentId === studentId);
      if (candidate) {
        candidate.isShortlisted = !candidate.isShortlisted;
        return candidate.isShortlisted;
      }
      return false;
    }
  },

  async releaseShortlist(jobId: string = 'job-demo-001', notes?: string): Promise<{
    success: boolean;
    releasedCount: number;
    releasedAt: string;
    releasedBy: string;
    message: string;
  }> {
    try {
      return await request(`/api/placement/shortlist/release`, {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          releasedBy: 'Dr. Ramesh Sharma (Placement Cell)',
          notes: notes || 'Shortlist approved and officially released by Placement Officer.',
        }),
      });
    } catch {
      const approved = localRanking.filter(r => r.isShortlisted);
      return {
        success: true,
        releasedCount: approved.length,
        releasedAt: new Date().toISOString(),
        releasedBy: 'Dr. Ramesh Sharma (Placement Cell)',
        message: 'Shortlist approved and officially released to company recruiter.',
      };
    }
  },

  async updateApplicationStage(
    applicationId: string,
    newStage: ApplicationStage,
    notes?: string
  ): Promise<Application> {
    try {
      return await request<Application>(`/api/applications/${applicationId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ newStage, notes }),
      });
    } catch {
      const app = localApplications.find(a => a.id === applicationId);
      if (!app) throw new Error('Application not found');
      
      const previousStage = app.currentStage;
      app.currentStage = newStage;
      app.events.push({
        id: `ev-event-${Date.now()}`,
        applicationId,
        fromStage: previousStage,
        toStage: newStage,
        timestamp: new Date().toLocaleString(),
        actorName: 'Dr. Ramesh Sharma',
        actorRole: 'PLACEMENT_OFFICER',
        notes: notes || `Application moved to ${newStage}`,
      });
      return app;
    }
  },

  async reviewEvidence(
    evidenceId: string,
    status: string,
    reviewer: string,
    notes?: string
  ): Promise<{ success: boolean; evidence: any }> {
    return await request(`/api/evidence/${evidenceId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewer, notes }),
    });
  },

  async submitProjectEvaluation(evalData: {
    studentId: string;
    projectId?: string;
    skillIds: string[];
    projectName: string;
    repoUrl?: string;
    reviewer: string;
    criteria: {
      architecture: number;
      codeQuality: number;
      testCoverage: number;
      skillDemonstration: number;
    };
    rationale: string;
  }): Promise<{ success: boolean; evaluation: any; evidenceArtifacts: any[] }> {
    return await request('/api/assessments/project-eval', {
      method: 'POST',
      body: JSON.stringify(evalData),
    });
  },
};
