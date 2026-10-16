import { request } from './client';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
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

  async getApplications(): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbApps } = await supabase
          .from('applications')
          .select('*, jobs(*), profiles(*), application_events(*)');

        if (dbApps && dbApps.length > 0) {
          const stageMapFromDb: Record<string, ApplicationStage> = {
            'ASSESSMENT': 'TECHNICAL_ASSESSMENT',
            'OFFERED': 'OFFER',
          };

          return dbApps.map((a: any) => {
            const currentStage = (stageMapFromDb[a.current_stage] || a.current_stage || 'APPLIED') as ApplicationStage;
            return {
              id: a.id,
              jobId: a.job_id,
              jobTitle: a.jobs?.title || 'Product UI/UX Engineer',
              companyName: a.jobs?.company_name || 'Zenith Studio Labs',
              studentId: a.student_id,
              studentName: a.profiles?.full_name || 'Alex Morgan',
              appliedAt: new Date(a.created_at).toLocaleDateString(),
              currentStage,
              fitScore: 82,
              events: (a.application_events || []).map((ev: any) => ({
                id: ev.id,
                applicationId: ev.application_id,
                fromStage: ev.from_stage,
                toStage: (stageMapFromDb[ev.to_stage] || ev.to_stage) as ApplicationStage,
                timestamp: new Date(ev.created_at).toLocaleString(),
                actorName: 'Dr. Ramesh Sharma',
                actorRole: 'PLACEMENT_OFFICER',
                notes: ev.notes,
              })),
            };
          });
        }
      } catch (e) {
        console.warn('Supabase getApplications notice:', e);
      }
    }

    return localApplications;
  },

  async updateApplicationStage(
    applicationId: string,
    newStage: ApplicationStage,
    notes?: string
  ): Promise<Application> {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const stageMapToDb: Record<string, string> = {
      'APPLIED': 'APPLIED',
      'SHORTLISTED': 'SHORTLISTED',
      'TECHNICAL_ASSESSMENT': 'ASSESSMENT',
      'INTERVIEW': 'INTERVIEW',
      'OFFER': 'OFFERED',
      'REJECTED': 'REJECTED',
    };
    const dbStage = stageMapToDb[newStage] || newStage;

    // 1. Commit directly to Supabase if configured and UUID
    if (isSupabaseConfigured && supabase && isUuid(applicationId)) {
      try {
        await supabase
          .from('applications')
          .update({
            current_stage: dbStage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', applicationId);

        await supabase.from('application_events').insert({
          application_id: applicationId,
          to_stage: dbStage,
          notes: notes || `Application transitioned to ${newStage.replace('_', ' ')}`,
        });
      } catch (e) {
        console.warn('Supabase application stage commit notice:', e);
      }
    }

    // 2. Locate or instantiate in local application state
    let app = localApplications.find(a => a.id === applicationId);
    if (!app) {
      const demoFound = DEMO_APPLICATIONS.find(a => a.id === applicationId);
      if (demoFound) {
        app = { ...demoFound };
        localApplications.push(app);
      } else {
        app = {
          id: applicationId,
          jobId: 'job-demo-001',
          jobTitle: 'Product UI/UX Engineer',
          companyName: 'Zenith Studio Labs',
          studentId: 'student-demo-001',
          studentName: 'Alex Morgan',
          appliedAt: new Date().toLocaleDateString(),
          currentStage: newStage,
          fitScore: 82,
          events: [],
        };
        localApplications.push(app);
      }
    }

    const previousStage = app.currentStage;
    app.currentStage = newStage;
    if (!app.events) app.events = [];
    app.events.push({
      id: `ev-event-${Date.now()}`,
      applicationId,
      fromStage: previousStage,
      toStage: newStage,
      timestamp: new Date().toLocaleString(),
      actorName: 'Dr. Ramesh Sharma',
      actorRole: 'PLACEMENT_OFFICER',
      notes: notes || `Application transitioned to ${newStage.replace('_', ' ')}`,
    });

    return app;
  },

  async reviewEvidence(
    evidenceId: string,
    status: string,
    reviewer: string,
    notes?: string
  ): Promise<{ success: boolean; evidence: any }> {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    if (isSupabaseConfigured && supabase && isUuid(evidenceId)) {
      try {
        const dbStatus = status === 'MANUALLY_REVIEWED' ? 'ISSUER_VERIFIED' : status;
        await supabase
          .from('evidence_records')
          .update({
            status: dbStatus,
            verified_at: new Date().toISOString(),
          })
          .eq('id', evidenceId);
      } catch (e) {
        console.warn('Supabase evidence review notice:', e);
      }
    }

    return {
      success: true,
      evidence: { id: evidenceId, status, reviewer, notes },
    };
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
    return {
      success: true,
      evaluation: { id: `eval-${Date.now()}`, ...evalData, score: 85 },
      evidenceArtifacts: [
        {
          id: `ev-eval-${Date.now()}`,
          studentId: evalData.studentId,
          title: `Project Evaluation: ${evalData.projectName}`,
          type: 'PROJECT',
          status: 'VERIFIED',
          score: 85,
        },
      ],
    };
  },
};
