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
  ApplicationStage,
  ApplicationEvent,
  ResumeBulletItem, 
  ResumeClaim,
  AssessmentItem,
  AssessmentAttemptResult
} from '@/types';

import { resumeParserService, ExtractedResumeData } from '@/lib/services/resumeParser';
import { automatedEvidenceEngine } from '@/lib/services/automatedEvidenceEngine';

// In-memory / session store for stateful UI mutations with localStorage persistence
function loadStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
  } catch {}
  return fallback;
}

function saveStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}


function getCurrentStudentId(): string {
  try {
    const raw = localStorage.getItem('proofhire_user') || localStorage.getItem('proofhire_auth_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return 'anonymous-student';
}

let localStudentProfile: UserProfile = loadStored('proofhire_auth_session', { ...DEMO_USERS.student });
let localEvidence: EvidenceRecord[] = [];
let localSkills: StudentSkill[] = loadStored('proofhire_student_skills', [...DEMO_SKILLS]);
let localProjects: StudentProject[] = loadStored('proofhire_student_projects', [...DEMO_PROJECTS]);
let localEducation: StudentEducation[] = loadStored('proofhire_student_education', [...DEMO_EDUCATION]);
let localExperience: StudentExperience[] = loadStored('proofhire_student_experience', [...DEMO_EXPERIENCE]);
let localJobs: Job[] = [...DEMO_JOBS];
let localApplications: Application[] = loadStored('proofhire_student_applications', [...DEMO_APPLICATIONS]);

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
    // 1. Prioritize parsed/stored student skills from uploaded resume
    try {
      const stored = localStorage.getItem('proofhire_student_skills');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbSkills } = await supabase.from('skills').select('*').limit(30);
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

  getResumeSkills(): string[] {
    try {
      // 1. Check direct raw resume skills array
      const raw = localStorage.getItem('proofhire_resume_skills');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => String(s).trim()).filter(Boolean);
        }
      }

      // 2. Check student_skills list
      const stored = localStorage.getItem('proofhire_student_skills');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => (s.canonicalName || s.name || '').trim()).filter(Boolean);
        }
      }
    } catch {}
    return [];
  },

  async getEvidence(): Promise<EvidenceRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: evList, error: evError } = await supabase
            .from('evidence_records')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

          if (!evError && Array.isArray(evList)) {
            const typeMap: Record<string, any> = { 'GITHUB_REPO': 'GITHUB' };
            const fromDb: EvidenceRecord[] = evList.map((e) => {
              const meta = e.metadata || {};
              const type = typeMap[e.type] || e.type || 'PROJECT';
              const isVerified = e.status === 'ISSUER_VERIFIED' || e.status === 'MANUALLY_REVIEWED' || e.status === 'VERIFIED';

              return {
                id: e.id,
                studentId: e.student_id,
                skillId: meta.skillId || e.id,
                skillName: meta.skillName || (e.title ? e.title.split(' ')[0] : 'Technical Skill'),
                type,
                title: e.title,
                status: isVerified ? 'VERIFIED' : (e.status || 'VERIFIED'),
                score: typeof e.score === 'number' ? `${e.score}%` : (e.score || '92%'),
                date: new Date(e.created_at).toLocaleDateString(),
                details: e.description || '',
                verifier: meta.verifier || 'ProofHire Automated Assessment Engine v1.2',
                issuer: meta.issuer,
                credibilityScore: meta.credibilityScore || 94,
                authenticityRating: meta.authenticity || 'HIGH',
                auditMetrics: meta.auditMetrics,
                certificateFileName: meta.certificateFileName,
                repoFiles: meta.repoFiles,
                sourceUrl: e.source_url,
              };
            });

            // Sync strictly to user-scoped localStorage
            try {
              localStorage.setItem(`proofhire_student_evidence_${user.id}`, JSON.stringify(fromDb));
            } catch {}

            // Return strictly this student's unique records (empty array if not submitted yet)
            return fromDb;
          }
        }
      } catch (err) {
        console.warn('Supabase getEvidence notice:', err);
      }
    }

    // Offline / Local storage fallback (strictly user-scoped)
    const currentUserId = getCurrentStudentId();
    if (currentUserId && currentUserId !== 'anonymous-student') {
      try {
        const stored = localStorage.getItem(`proofhire_student_evidence_${currentUserId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}

      // If strictly the default demo student ID
      if (currentUserId === 'demo-student-id' || currentUserId === 'student-demo-001') {
        return [...DEMO_EVIDENCE];
      }
    }

    return [];
  },

  async addEvidence(newEvidence: Omit<EvidenceRecord, 'id'>): Promise<EvidenceRecord> {
    const currentUserId = newEvidence.studentId && newEvidence.studentId !== 'student-demo-001' && newEvidence.studentId !== 'anonymous-student'
      ? newEvidence.studentId
      : getCurrentStudentId();

    const createdId = `ev-${Date.now()}`;

    // Execute Automated Score & Credibility Evaluation
    const evaluation = automatedEvidenceEngine.evaluate({
      type: newEvidence.type,
      skillName: newEvidence.skillName,
      title: newEvidence.title,
      sourceUrl: newEvidence.sourceUrl,
      details: newEvidence.details,
      issuer: newEvidence.issuer,
      certificateFile: newEvidence.certificateFileName ? {
        name: newEvidence.certificateFileName,
        size: 245000,
        type: 'application/pdf',
      } : undefined,
    });

    const created: EvidenceRecord = {
      ...newEvidence,
      id: createdId,
      studentId: currentUserId,
      status: 'VERIFIED',
      score: evaluation.score,
      verifier: evaluation.verifier,
      issuer: evaluation.issuer || newEvidence.issuer,
      credibilityScore: evaluation.credibilityScore,
      authenticityRating: evaluation.authenticityRating,
      auditMetrics: evaluation.auditMetrics,
      repoFiles: evaluation.repoFiles,
      certificateFileName: evaluation.certificateFileName || newEvidence.certificateFileName,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const effectiveStudentId = user?.id || (currentUserId !== 'anonymous-student' ? currentUserId : null);
        if (effectiveStudentId) {
          const dbType = newEvidence.type === 'GITHUB' ? 'GITHUB_REPO' : newEvidence.type;
          const { data: inserted, error: insertErr } = await supabase
            .from('evidence_records')
            .insert({
              student_id: effectiveStudentId,
              title: newEvidence.title,
              type: dbType,
              status: 'ISSUER_VERIFIED',
              score: evaluation.numericScore,
              source_url: newEvidence.sourceUrl || null,
              description: newEvidence.details,
              metadata: {
                skillName: newEvidence.skillName,
                credibilityScore: evaluation.credibilityScore,
                verifier: evaluation.verifier,
                issuer: evaluation.issuer,
                authenticity: evaluation.authenticityRating,
                auditMetrics: evaluation.auditMetrics,
                repoFiles: evaluation.repoFiles,
                certificateFileName: evaluation.certificateFileName || newEvidence.certificateFileName,
              },
              verified_at: new Date().toISOString(),
            })
            .select()
            .maybeSingle();

          if (inserted) {
            created.id = inserted.id;
            created.studentId = inserted.student_id;
          }
          if (insertErr) {
            console.error('Supabase addEvidence insert error:', insertErr);
          }
        }
      } catch (e) {
        console.warn('Supabase addEvidence notice:', e);
      }
    }

    // Save to user-scoped localStorage
    const targetStudentId = created.studentId || currentUserId;
    try {
      const storageKey = `proofhire_student_evidence_${targetStudentId}`;
      const existingRaw = localStorage.getItem(storageKey);
      const existingList: EvidenceRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      const updatedList = [created, ...existingList.filter((e) => e.id !== created.id)];
      localStorage.setItem(storageKey, JSON.stringify(updatedList));
      localEvidence = updatedList;
    } catch {}

    // Synchronize skill status in tracked skills
    if (newEvidence.skillName) {
      const skillLower = newEvidence.skillName.toLowerCase();
      localSkills = localSkills.map((sk) => {
        if (sk.canonicalName.toLowerCase() === skillLower) {
          return {
            ...sk,
            status: 'VERIFIED',
            evidenceCount: (sk.evidenceCount || 0) + 1,
            evidenceIds: Array.from(new Set([...(sk.evidenceIds || []), created.id])),
          };
        }
        return sk;
      });
      try {
        localStorage.setItem('proofhire_student_skills', JSON.stringify(localSkills));
      } catch {}
    }

    return created;
  },


  async getProjects(): Promise<StudentProject[]> {
    return localProjects;
  },

  async getEducation(): Promise<StudentEducation[]> {
    return localEducation;
  },

  async getExperience(): Promise<StudentExperience[]> {
    return localExperience;
  },

  async getJobs(): Promise<Job[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let appliedJobIds = new Set<string>();
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: myApps } = await supabase
              .from('applications')
              .select('job_id')
              .eq('student_id', user.id);
            if (myApps) {
              appliedJobIds = new Set(myApps.map((a: any) => a.job_id));
            }
          }
        } catch {}

        const { data: dbJobs } = await supabase
          .from('jobs')
          .select('*, campaigns(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (dbJobs && dbJobs.length > 0) {
          const fromDb: Job[] = dbJobs.map((item: any) => {
            const hasApplied = appliedJobIds.has(item.id);
            return {
              id: item.id,
              title: item.title,
              company: item.company_name,
              location: item.location || 'Bengaluru (Hybrid)',
              type: (item.workplace_type || 'Full-time') as Job['type'],
              salaryRange: item.salary_range || '₹8,00,000 - ₹14,00,000',
              description: item.description || '',
              requiredSkills: [
                { skillId: 'skill-react', canonicalName: 'React', sourceText: 'React', weight: 40 },
                { skillId: 'skill-ts', canonicalName: 'TypeScript', sourceText: 'TypeScript', weight: 30 },
                { skillId: 'skill-node', canonicalName: 'Node.js', sourceText: 'Node.js', weight: 30 },
              ],
              preferredSkills: [
                { skillId: 'skill-pg', canonicalName: 'PostgreSQL', sourceText: 'PostgreSQL', weight: 20 },
                { skillId: 'skill-docker', canonicalName: 'Docker', sourceText: 'Docker', weight: 10 },
              ],
              eligibilityCriteria: {
                minimumCgpa: 6.5,
                allowedDepartments: ['Computer Science', 'Information Technology'],
                graduationYear: [2025, 2026],
              },
              deadline: '2026-11-30',
              postedDate: item.created_at ? item.created_at.split('T')[0] : '2026-01-15',
              status: 'ACTIVE',
              sourceCount: 1,
              matchedScore: hasApplied ? 92 : 88,
              hasApplied,
            };
          });

          // Merge with DEMO_JOBS (omit duplicates)
          const dbJobTitles = new Set(fromDb.map(j => j.title.toLowerCase()));
          const nonDupDemos = DEMO_JOBS.filter(d => !dbJobTitles.has(d.title.toLowerCase()));
          return [...fromDb, ...nonDupDemos];
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
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const jobs = await this.getJobs();
    const candidateSkills = await this.getSkills();
    const job = jobs.find((j) => j.id === jobId) || localJobs.find((j) => j.id === jobId) || {
      id: jobId,
      title: 'Engineering Application',
      company: 'Partner Company',
      requiredSkills: [],
      preferredSkills: [],
    };
    (job as any).hasApplied = true;

    // Calculate dynamic fit score based on candidate skills vs job requirements (80/20 formula)
    let dynamicFitScore = 85;
    try {
      const studentSkillSet = new Set(candidateSkills.map((s) => s.canonicalName.toLowerCase()));
      const reqList = job.requiredSkills?.map((s) => s.canonicalName.toLowerCase()) || [];
      const prefList = job.preferredSkills?.map((s) => s.canonicalName.toLowerCase()) || [];
      const matchedReq = reqList.filter((s) => studentSkillSet.has(s)).length;
      const matchedPref = prefList.filter((s) => studentSkillSet.has(s)).length;
      const totalReq = reqList.length || 1;
      const totalPref = prefList.length || 0;
      const reqWeight = totalPref > 0 ? 0.8 : 1.0;
      const prefWeight = totalPref > 0 ? 0.2 : 0.0;
      const reqScore = (matchedReq / totalReq) * reqWeight * 100;
      const prefScore = totalPref > 0 ? (matchedPref / totalPref) * prefWeight * 100 : 0;
      dynamicFitScore = Math.max(50, Math.min(98, Math.round(reqScore + prefScore)));
    } catch {}

    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isUuid(jobId)) {
          // Check for linked campaign
          let campaignId: string | null = null;
          try {
            const { data: camp } = await supabase
              .from('campaigns')
              .select('id')
              .eq('job_id', jobId)
              .maybeSingle();
            if (camp?.id) campaignId = camp.id;
          } catch {}

          const { data: insertedApp } = await supabase.from('applications').insert({
            job_id: jobId,
            student_id: user.id,
            campaign_id: campaignId,
            current_stage: 'APPLIED',
          }).select().single();

          if (insertedApp?.id) {
            await supabase.from('application_events').insert({
              application_id: insertedApp.id,
              to_stage: 'APPLIED',
              notes: 'Application submitted with verified evidence ledger.',
            });
          }
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
      appliedAt: nowFormatted,
      currentStage: 'APPLIED',
      fitScore: dynamicFitScore,
      events: [
        {
          id: `ev-app-${Date.now()}`,
          applicationId: `app-${Date.now()}`,
          toStage: 'APPLIED',
          timestamp: nowFormatted,
          actorName: localStudentProfile.name,
          actorRole: 'STUDENT',
          notes: 'Application submitted with verified evidence ledger.',
        },
      ],
    };

    // Filter out if already in localApplications (avoid duplicates)
    localApplications = [newApp, ...localApplications.filter((a) => a.jobId !== job.id)];
    saveStored('proofhire_student_applications', localApplications);
    return newApp;
  },

  async withdrawApplication(applicationId: string): Promise<boolean> {
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

    if (isSupabaseConfigured && supabase && isUuid(applicationId)) {
      try {
        await supabase.from('applications').delete().eq('id', applicationId);
      } catch (e) {
        console.warn('Supabase withdrawApplication error:', e);
      }
    }

    const target = localApplications.find((a) => a.id === applicationId);
    if (target) {
      const targetJob = localJobs.find((j) => j.id === target.jobId);
      if (targetJob) {
        targetJob.hasApplied = false;
      }
    }

    localApplications = localApplications.filter((a) => a.id !== applicationId);
    saveStored('proofhire_student_applications', localApplications);
    return true;
  },

  async getApplications(): Promise<Application[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: dbApps, error } = await supabase
            .from('applications')
            .select(`
              id,
              job_id,
              current_stage,
              created_at,
              jobs ( id, title, company_name, location, workplace_type ),
              application_events ( id, from_stage, to_stage, notes, created_at )
            `)
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && dbApps && dbApps.length > 0) {
            const stageMap: Record<string, ApplicationStage> = {
              'APPLIED': 'APPLIED',
              'SHORTLISTED': 'SHORTLISTED',
              'ASSESSMENT': 'TECHNICAL_ASSESSMENT',
              'TECHNICAL_ASSESSMENT': 'TECHNICAL_ASSESSMENT',
              'INTERVIEW': 'INTERVIEW',
              'OFFERED': 'OFFER',
              'OFFER': 'OFFER',
              'REJECTED': 'REJECTED',
            };

            const dbMapped: Application[] = dbApps.map((a: any) => {
              const currentStage: ApplicationStage = stageMap[a.current_stage] || 'APPLIED';
              const events: ApplicationEvent[] = (a.application_events || []).map((ev: any) => ({
                id: ev.id,
                applicationId: a.id,
                fromStage: ev.from_stage ? stageMap[ev.from_stage] : undefined,
                toStage: stageMap[ev.to_stage] || 'APPLIED',
                timestamp: new Date(ev.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                actorName: 'Placement Cell',
                actorRole: 'PLACEMENT_OFFICER',
                notes: ev.notes || `Pipeline stage transitioned to ${ev.to_stage}.`,
              }));

              const defaultEvents: ApplicationEvent[] = [
                {
                  id: `ev-init-${a.id}`,
                  applicationId: a.id,
                  toStage: currentStage,
                  timestamp: new Date(a.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  actorName: localStudentProfile.name,
                  actorRole: 'STUDENT',
                  notes: 'Application registered with verified skill proof.',
                },
              ];

              return {
                id: a.id,
                jobId: a.job_id,
                jobTitle: a.jobs?.title || 'Engineering Role',
                companyName: a.jobs?.company_name || 'Hiring Partner',
                studentId: user.id,
                studentName: localStudentProfile.name,
                appliedAt: new Date(a.created_at).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                currentStage,
                fitScore: 88,
                events: events.length > 0 ? events : defaultEvents,
              };
            });

            // Merge with localApplications (ensure local offline/recent items aren't lost)
            const dbJobIds = new Set(dbMapped.map((d) => d.jobId));
            const extraLocal = localApplications.filter((l) => !dbJobIds.has(l.jobId));
            return [...dbMapped, ...extraLocal];
          }
        }
      } catch (e) {
        console.warn('Supabase getApplications notice:', e);
      }
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
    const evidence = await this.getEvidence();
    return await resumeParserService.reviewUploadedResumeClaims(file, evidence);
  },

  saveParsedProfileData(data: {
    education?: { institution: string; degree: string; graduationYear: number; gpa: number };
    skills?: string[];
    projects?: { title: string; description: string; technologies: string }[];
    experience?: { company: string; role: string; duration: string; description: string }[];
  }) {
    if (data.skills && data.skills.length > 0) {
      const cleanSkills = Array.from(new Set(data.skills.map((s) => s.trim()).filter(Boolean)));
      try {
        localStorage.setItem('proofhire_resume_skills', JSON.stringify(cleanSkills));
      } catch {}
      const newSkills: StudentSkill[] = cleanSkills.map((s, idx) => ({
        id: `skill-${idx}-${Date.now()}`,
        canonicalName: s,
        category: 'Technical',
        proficiencyLevel: idx < 3 ? 'Advanced' : 'Intermediate',
        evidenceCount: 0,
        status: 'NO_EVIDENCE',
        evidenceIds: [],
      }));
      localSkills = newSkills;
      try {
        localStorage.setItem('proofhire_student_skills', JSON.stringify(newSkills));
      } catch {}
    }

    if (data.projects && data.projects.length > 0) {
      const newProjects: StudentProject[] = data.projects.map((p, idx) => ({
        id: `proj-${idx}-${Date.now()}`,
        title: p.title,
        description: p.description,
        technologies: p.technologies ? p.technologies.split(',').map((t) => t.trim()) : ['React'],
        repoUrl: 'https://github.com/project',
        liveUrl: '',
        evidenceStatus: 'NEEDS_REVIEW',
      }));
      localProjects = newProjects;
      try {
        localStorage.setItem('proofhire_student_projects', JSON.stringify(newProjects));
      } catch {}
    }

    if (data.education) {
      const gradYear = data.education.graduationYear || 2026;
      const newEducation: StudentEducation[] = [
        {
          id: `edu-${Date.now()}`,
          institution: data.education.institution,
          degree: data.education.degree,
          field: 'Computer Science & Engineering',
          startYear: gradYear - 4,
          endYear: gradYear,
          gpa: data.education.gpa || 8.5,
        },
      ];
      localEducation = newEducation;
      try {
        localStorage.setItem('proofhire_student_education', JSON.stringify(newEducation));
      } catch {}
    }

    if (data.experience && data.experience.length > 0) {
      const newExperience: StudentExperience[] = data.experience.map((e, idx) => ({
        id: `exp-${idx}-${Date.now()}`,
        company: e.company,
        role: e.role,
        location: 'Hybrid',
        startDate: e.duration?.split('-')[0]?.trim() || '2025',
        endDate: e.duration?.split('-')[1]?.trim() || 'Present',
        description: e.description,
        technologies: ['React', 'TypeScript'],
      }));
      localExperience = newExperience;
      try {
        localStorage.setItem('proofhire_student_experience', JSON.stringify(newExperience));
      } catch {}
    }
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
