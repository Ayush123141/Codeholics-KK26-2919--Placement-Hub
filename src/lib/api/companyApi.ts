import { request } from './client';
import { DEMO_JOBS, DEMO_BATCH_RANKING } from './demoData';
import { Job, MatchingResult } from '@/types';

let localCompanyJobs: Job[] = DEMO_JOBS.filter(j => j.company.includes('CloudScale'));
let localShortlist: MatchingResult[] = DEMO_BATCH_RANKING.filter(c => c.isShortlisted);

export const companyApi = {
  async getMetrics() {
    return {
      activeVacancies: localCompanyJobs.length,
      sharedCandidates: localShortlist.length,
      interviewsScheduled: localShortlist.filter(c => c.applicationStage === 'INTERVIEW').length,
      offersExtended: 1,
    };
  },

  async getVacancies(): Promise<Job[]> {
    try {
      return await request<Job[]>('/api/company/vacancies');
    } catch {
      return localCompanyJobs;
    }
  },

  async createVacancy(newVacancy: Omit<Job, 'id' | 'postedDate' | 'sourceCount' | 'matchedScore' | 'hasApplied'>): Promise<Job> {
    try {
      return await request<Job>('/api/company/vacancies', {
        method: 'POST',
        body: JSON.stringify(newVacancy),
      });
    } catch {
      const created: Job = {
        ...newVacancy,
        id: `job-${Date.now()}`,
        postedDate: new Date().toISOString().split('T')[0],
        sourceCount: 1,
      };
      localCompanyJobs = [created, ...localCompanyJobs];
      return created;
    }
  },

  async getSharedShortlist(campaignId?: string): Promise<MatchingResult[]> {
    try {
      return await request<MatchingResult[]>(`/api/company/candidates${campaignId ? `?campaignId=${campaignId}` : ''}`);
    } catch {
      return localShortlist;
    }
  },

  async scheduleInterview(candidateId: string, interviewDate: string, notes?: string): Promise<{ success: boolean }> {
    try {
      return await request(`/api/company/candidates/${candidateId}/schedule-interview`, {
        method: 'POST',
        body: JSON.stringify({ interviewDate, notes }),
      });
    } catch {
      const cand = localShortlist.find(c => c.studentId === candidateId);
      if (cand) {
        cand.applicationStage = 'INTERVIEW';
      }
      return { success: true };
    }
  },
};
