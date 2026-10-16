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
  ResumeClaim,
  AssessmentItem,
  AssessmentAttemptResult
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
      return await request<Job[]>('/api/jobs');
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

  async getAssessments(): Promise<AssessmentItem[]> {
    try {
      const res = await request<{ success: boolean; assessments: AssessmentItem[] }>('/api/assessments');
      return res.assessments || [];
    } catch {
      return [
        {
          id: 'assess-react-v1',
          skillId: 'skill-react',
          title: 'React Fundamentals & Component Architecture',
          version: '1.0',
          durationMinutes: 15,
          instructions: 'Answer all questions objectively. Passing threshold is 70%. Answers are graded deterministically server-side.',
          questionCount: 4,
          questions: [
            {
              id: 'q1',
              question: 'What hook is used to run side effects in a function component?',
              options: ['useMemo', 'useEffect', 'useState', 'useRef'],
            },
            {
              id: 'q2',
              question: 'What is the primary purpose of keys in React lists?',
              options: [
                'To style DOM elements uniquely',
                'To identify which items have changed, been added, or removed for reconciliation',
                'To pass props between siblings',
                'To bind event handlers automatically',
              ],
            },
            {
              id: 'q3',
              question: 'How does React handle state batching in React 18+?',
              options: [
                'Only synchronous events inside React handlers are batched',
                'State updates are never batched',
                'Automatic batching applies across promises, setTimeout, and native event handlers',
                'Batching must be manually enabled via unstable_batchedUpdates',
              ],
            },
            {
              id: 'q4',
              question: 'Which of the following creates an unmodifiable memoized callback?',
              options: ['useMemo', 'useCallback', 'useReducer', 'useLayoutEffect'],
            },
          ],
        },
        {
          id: 'assess-nodejs-v1',
          skillId: 'skill-nodejs',
          title: 'Node.js Core Architecture & Asynchronous I/O',
          version: '1.0',
          durationMinutes: 15,
          instructions: 'Answer all questions objectively. Passing threshold is 70%.',
          questionCount: 3,
          questions: [
            {
              id: 'q1',
              question: 'Which phase of the Node.js event loop executes setImmediate() callbacks?',
              options: ['Timers', 'Pending callbacks', 'Poll', 'Check'],
            },
            {
              id: 'q2',
              question: 'What is the main benefit of Node.js Streams?',
              options: [
                'Encrypting data at rest',
                'Processing large chunks of data piece-by-piece without buffering everything in RAM',
                'Enabling multi-threading without worker_threads',
                'Converting callbacks into Promises automatically',
              ],
            },
            {
              id: 'q3',
              question: 'What happens if an unhandled promise rejection occurs in modern Node.js?',
              options: [
                'It is silently ignored',
                'The process terminates with a non-zero exit code by default',
                'It retries the operation 3 times',
                'It pauses execution indefinitely',
              ],
            },
          ],
        },
      ];
    }
  },

  async submitAssessment(
    studentId: string,
    assessmentId: string,
    answers: number[]
  ): Promise<{ attempt: AssessmentAttemptResult; message: string; evidence?: any }> {
    return await request('/api/assessments/submit', {
      method: 'POST',
      body: JSON.stringify({ studentId, assessmentId, answers }),
    });
  },

  async getStudentAssessmentAttempts(studentId: string): Promise<AssessmentAttemptResult[]> {
    try {
      const res = await request<{ success: boolean; attempts: AssessmentAttemptResult[] }>(
        `/api/assessments/student/${studentId}`
      );
      return res.attempts || [];
    } catch {
      return [];
    }
  },
};
