import { request } from './client';
import { 
  DEMO_USERS, 
  DEMO_SKILLS, 
  DEMO_EVIDENCE, 
  DEMO_PROJECTS, 
  DEMO_EDUCATION, 
  DEMO_EXPERIENCE, 
  DEMO_JOBS, 
  DEMO_APPLICATIONS, 
  DEMO_RESUME_BULLETS, 
  DEMO_RESUME_CLAIMS 
} from './demoData';
import { 
  UserProfile, 
  StudentSkill, 
  EvidenceRecord, 
  StudentProject, 
  StudentEducation, 
  StudentExperience, 
  Job, 
  Application, 
  ResumeBulletItem, 
  ResumeClaim 
} from '@/types';

// In-memory / session store for stateful UI mutations during offline or development mode
let localStudentProfile: UserProfile = { ...DEMO_USERS.student };
let localEvidence: EvidenceRecord[] = [...DEMO_EVIDENCE];
let localSkills: StudentSkill[] = [...DEMO_SKILLS];
let localProjects: StudentProject[] = [...DEMO_PROJECTS];
let localJobs: Job[] = [...DEMO_JOBS];
let localApplications: Application[] = [...DEMO_APPLICATIONS];

export const studentApi = {
  async getProfile(): Promise<UserProfile> {
    try {
      return await request<UserProfile>('/api/student/profile');
    } catch {
      return localStudentProfile;
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      return await request<UserProfile>('/api/student/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch {
      localStudentProfile = { ...localStudentProfile, ...updates };
      return localStudentProfile;
    }
  },

  async getSkills(): Promise<StudentSkill[]> {
    try {
      return await request<StudentSkill[]>('/api/student/skills');
    } catch {
      return localSkills;
    }
  },

  async getEvidence(): Promise<EvidenceRecord[]> {
    try {
      return await request<EvidenceRecord[]>('/api/student/evidence');
    } catch {
      return localEvidence;
    }
  },

  async addEvidence(newEvidence: Omit<EvidenceRecord, 'id'>): Promise<EvidenceRecord> {
    try {
      return await request<EvidenceRecord>('/api/student/evidence', {
        method: 'POST',
        body: JSON.stringify(newEvidence),
      });
    } catch {
      const created: EvidenceRecord = {
        ...newEvidence,
        id: `ev-custom-${Date.now()}`,
      };
      localEvidence = [created, ...localEvidence];
      return created;
    }
  },

  async getProjects(): Promise<StudentProject[]> {
    try {
      return await request<StudentProject[]>('/api/student/projects');
    } catch {
      return localProjects;
    }
  },

  async getEducation(): Promise<StudentEducation[]> {
    return DEMO_EDUCATION;
  },

  async getExperience(): Promise<StudentExperience[]> {
    return DEMO_EXPERIENCE;
  },

  async getJobs(): Promise<Job[]> {
    try {
      const response = await request<any>('/api/jobs');
      const list = Array.isArray(response) 
        ? response 
        : Array.isArray(response?.data) 
          ? response.data 
          : [];

      if (!list.length) return localJobs;

      return list.map((item: any) => ({
        id: item.id || `job-${Math.random()}`,
        title: item.title || 'Software Engineer',
        company: item.company || item.company_name || 'Tech Company',
        location: item.location || 'Remote',
        type: (item.type || item.workplace_type || 'Full-time') as Job['type'],
        salaryRange: item.salaryRange || item.salary_range || 'Competitive',
        description: item.description || '',
        requiredSkills: (item.requiredSkills || []).map((sk: any) => 
          typeof sk === 'string' ? { skillId: sk, canonicalName: sk, sourceText: sk, weight: 1 } : sk
        ),
        preferredSkills: (item.preferredSkills || []).map((sk: any) => 
          typeof sk === 'string' ? { skillId: sk, canonicalName: sk, sourceText: sk, weight: 1 } : sk
        ),
        eligibilityCriteria: item.eligibilityCriteria || {
          minimumCgpa: 6.5,
          allowedDepartments: ['Computer Science', 'Information Technology'],
          graduationYear: [2025, 2026],
        },
        deadline: item.deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        postedDate: item.postedDate || item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: item.status || (item.is_active !== false ? 'ACTIVE' : 'CLOSED'),
        sourceCount: item.sourceCount || (Array.isArray(item.job_sources) ? item.job_sources.length : 1),
        matchedScore: item.matchedScore || 85,
        hasApplied: item.hasApplied || false,
      }));
    } catch {
      return localJobs;
    }
  },

  async getJobById(jobId: string): Promise<Job | undefined> {
    try {
      return await request<Job>(`/api/jobs/${jobId}`);
    } catch {
      return localJobs.find((j) => j.id === jobId);
    }
  },

  async applyToJob(jobId: string): Promise<Application> {
    try {
      return await request<Application>(`/api/jobs/${jobId}/apply`, {
        method: 'POST',
      });
    } catch {
      const job = localJobs.find((j) => j.id === jobId);
      if (!job) throw new Error('Job not found');
      
      job.hasApplied = true;

      const newApp: Application = {
        id: `app-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company,
        studentId: localStudentProfile.id,
        studentName: localStudentProfile.name,
        appliedAt: new Date().toLocaleString(),
        currentStage: 'APPLIED',
        fitScore: job.matchedScore || 75,
        events: [
          {
            id: `ev-app-${Date.now()}`,
            applicationId: `app-${Date.now()}`,
            toStage: 'APPLIED',
            timestamp: new Date().toLocaleString(),
            actorName: localStudentProfile.name,
            actorRole: 'STUDENT',
            notes: 'Application submitted with verified evidence summary.',
          },
        ],
      };

      localApplications = [newApp, ...localApplications];
      return newApp;
    }
  },

  async getApplications(): Promise<Application[]> {
    try {
      return await request<Application[]>('/api/student/applications');
    } catch {
      return localApplications;
    }
  },

  async getResumeBullets(jobId?: string): Promise<ResumeBulletItem[]> {
    try {
      return await request<ResumeBulletItem[]>(`/api/resumes/bullets${jobId ? `?jobId=${jobId}` : ''}`);
    } catch {
      return DEMO_RESUME_BULLETS;
    }
  },

  async reviewUploadedResumeClaims(file: File): Promise<{
    fileName: string;
    extractedTextCount: number;
    claims: ResumeClaim[];
    summary: { supported: number; needsReview: number; contradicted: number };
  }> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      return await request('/api/resumes/claim-review', {
        method: 'POST',
        body: formData,
      });
    } catch {
      // Deterministic evaluation result reflecting the demo scenario:
      // Includes supported claims with evidence links, 1 needs review (unverified issuer), and 1 unsupported discrepancy.
      return {
        fileName: file.name,
        extractedTextCount: 1420,
        claims: DEMO_RESUME_CLAIMS,
        summary: {
          supported: 2,
          needsReview: 1,
          contradicted: 1,
        },
      };
    }
  },
};
