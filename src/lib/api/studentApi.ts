import { request } from './client';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
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

// In-memory / session store for stateful UI mutations
let localStudentProfile: UserProfile = { ...DEMO_USERS.student };
let localEvidence: EvidenceRecord[] = [...DEMO_EVIDENCE];
let localSkills: StudentSkill[] = [...DEMO_SKILLS];
let localProjects: StudentProject[] = [...DEMO_PROJECTS];
let localJobs: Job[] = [...DEMO_JOBS];
let localApplications: Application[] = [...DEMO_APPLICATIONS];

export const studentApi = {
  async getProfile(): Promise<UserProfile> {
    // 1. Direct Supabase Query if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            const userProfile: UserProfile = {
              id: profile.id,
              name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Candidate',
              email: profile.email || user.email || '',
              role: profile.role || 'STUDENT',
              department: profile.department || 'Computer Science',
              graduationYear: profile.cohort_year || 2026,
              headline: profile.headline || 'B.Tech in Computer Science & Engineering',
              college: 'TechSummit Institute of Technology',
              degree: 'B.Tech in Computer Science & Engineering',
              cgpa: 8.85,
            };
            return userProfile;
          }
        }
      } catch (e) {
        console.warn('Direct Supabase getProfile notice:', e);
      }
    }

    // 2. Local Session Cache
    try {
      const stored = localStorage.getItem('proofhire_auth_session') || sessionStorage.getItem('proofhire_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.name) return { ...localStudentProfile, ...parsed };
      }
    } catch {}

    return localStudentProfile;
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({
            full_name: updates.name,
            department: updates.department,
            cohort_year: updates.graduationYear,
            updated_at: new Date().toISOString(),
          }).eq('id', user.id);
        }
      } catch (e) {
        console.warn('Direct Supabase updateProfile notice:', e);
      }
    }

    localStudentProfile = { ...localStudentProfile, ...updates };
    try {
      localStorage.setItem('proofhire_auth_session', JSON.stringify(localStudentProfile));
    } catch {}
    return localStudentProfile;
  },

  async getSkills(): Promise<StudentSkill[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbSkills } = await supabase.from('skills').select('*').limit(20);
        if (dbSkills && dbSkills.length > 0) {
          return dbSkills.map((s, idx) => ({
            id: s.id,
            canonicalName: s.canonical_name,
            category: s.category || 'General',
            proficiencyLevel: idx % 2 === 0 ? 'Advanced' : 'Intermediate',
            evidenceCount: 2,
            status: 'VERIFIED',
            evidenceIds: [],
          }));
        }
      } catch {}
    }
    return localSkills;
  },

  async getEvidence(): Promise<EvidenceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: evList } = await supabase
            .from('evidence_records')
            .select('*')
            .eq('student_id', user.id);

          if (evList && evList.length > 0) {
            return evList.map((e) => ({
              id: e.id,
              studentId: e.student_id,
              skillId: e.id,
              skillName: e.title || 'Technical Skill',
              type: (e.type || 'PROJECT') as any,
              title: e.title,
              status: (e.status || 'VERIFIED') as any,
              score: e.score || 85,
              date: new Date(e.created_at).toLocaleDateString(),
              details: e.details || '',
            }));
          }
        }
      } catch {}
    }
    return localEvidence;
  },

  async addEvidence(newEvidence: Omit<EvidenceRecord, 'id'>): Promise<EvidenceRecord> {
    const createdId = `ev-${Date.now()}`;
    const created: EvidenceRecord = {
      ...newEvidence,
      id: createdId,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('evidence_records').insert({
            student_id: user.id,
            title: newEvidence.title,
            type: newEvidence.type || 'PROJECT',
            status: newEvidence.status || 'NEEDS_REVIEW',
            score: typeof newEvidence.score === 'number' ? newEvidence.score : 85,
            details: newEvidence.details || '',
          });
        }
      } catch (e) {
        console.warn('Supabase addEvidence notice:', e);
      }
    }

    localEvidence = [created, ...localEvidence];
    return created;
  },

  async getProjects(): Promise<StudentProject[]> {
    return localProjects;
  },

  async getEducation(): Promise<StudentEducation[]> {
    return DEMO_EDUCATION;
  },

  async getExperience(): Promise<StudentExperience[]> {
    return DEMO_EXPERIENCE;
  },

  async getJobs(): Promise<Job[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbJobs } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .limit(20);

        if (dbJobs && dbJobs.length > 0) {
          return dbJobs.map((item: any) => ({
            id: item.id,
            title: item.title,
            company: item.company_name,
            location: item.location || 'Remote',
            type: (item.workplace_type || 'Full-time') as Job['type'],
            salaryRange: item.salary_range || 'Competitive',
            description: item.description || '',
            requiredSkills: [],
            preferredSkills: [],
            eligibilityCriteria: {
              minimumCgpa: 6.5,
              allowedDepartments: ['Computer Science', 'Information Technology'],
              graduationYear: [2025, 2026],
            },
            deadline: '2026-06-30',
            postedDate: item.created_at ? item.created_at.split('T')[0] : '2026-01-15',
            status: 'ACTIVE',
            sourceCount: 1,
            matchedScore: 88,
            hasApplied: false,
          }));
        }
      } catch (e) {
        console.warn('Supabase getJobs fallback notice:', e);
      }
    }

    return localJobs;
  },

  async getJobById(jobId: string): Promise<Job | undefined> {
    const jobs = await this.getJobs();
    return jobs.find((j) => j.id === jobId) || localJobs.find((j) => j.id === jobId);
  },

  async applyToJob(jobId: string): Promise<Application> {
    const job = localJobs.find((j) => j.id === jobId) || { id: jobId, title: 'Job Application', company: 'Partner Company' };
    (job as any).hasApplied = true;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('applications').insert({
            job_id: jobId,
            student_id: user.id,
            stage: 'APPLIED',
          });
        }
      } catch (e) {
        console.warn('Supabase applyToJob notice:', e);
      }
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: (job as any).title,
      companyName: (job as any).company,
      studentId: localStudentProfile.id,
      studentName: localStudentProfile.name,
      appliedAt: new Date().toLocaleDateString(),
      currentStage: 'APPLIED',
      fitScore: 85,
      events: [
        {
          id: `ev-app-${Date.now()}`,
          applicationId: `app-${Date.now()}`,
          toStage: 'APPLIED',
          timestamp: new Date().toLocaleDateString(),
          actorName: localStudentProfile.name,
          actorRole: 'STUDENT',
          notes: 'Application submitted with verified evidence ledger.',
        },
      ],
    };

    localApplications = [newApp, ...localApplications];
    return newApp;
  },

  async getApplications(): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dbApps } = await supabase
            .from('applications')
            .select('*, jobs(*)')
            .eq('student_id', user.id);

          if (dbApps && dbApps.length > 0) {
            return dbApps.map((a: any) => ({
              id: a.id,
              jobId: a.job_id,
              jobTitle: a.jobs?.title || 'Applied Position',
              companyName: a.jobs?.company_name || 'Hiring Partner',
              studentId: a.student_id,
              studentName: localStudentProfile.name,
              appliedAt: new Date(a.created_at).toLocaleDateString(),
              currentStage: a.stage || 'APPLIED',
              fitScore: 85,
              events: [],
            }));
          }
        }
      } catch {}
    }

    return localApplications;
  },

  async getResumeBullets(_jobId?: string): Promise<ResumeBulletItem[]> {
    return DEMO_RESUME_BULLETS;
  },

  async reviewUploadedResumeClaims(file: File): Promise<{
    fileName: string;
    extractedTextCount: number;
    claims: ResumeClaim[];
    summary: { supported: number; needsReview: number; contradicted: number };
  }> {
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
  },

  async getAssessments(): Promise<AssessmentItem[]> {
    return [
      {
        id: 'assess-react-v1',
        skillId: 'skill-react',
        title: 'React Fundamentals & Component Architecture',
        version: '1.0',
        durationMinutes: 15,
        instructions: 'Answer all questions objectively. Passing threshold is 70%. Answers are graded deterministically.',
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
  },

  async submitAssessment(
    _studentId: string,
    _assessmentId: string,
    _answers: number[]
  ): Promise<{ attempt: AssessmentAttemptResult; message: string; evidence?: any }> {
    return {
      attempt: {
        id: `att-${Date.now()}`,
        studentId: _studentId,
        assessmentId: _assessmentId,
        skillId: 'skill-react',
        score: 85,
        passed: true,
        completedAt: new Date().toISOString(),
      },
      message: 'Assessment completed and verified into evidence ledger with 85% score.',
    };
  },

  async getStudentAssessmentAttempts(_studentId: string): Promise<AssessmentAttemptResult[]> {
    return [];
  },
};
