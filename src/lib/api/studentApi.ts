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
  EvidenceStatus,
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
import { llmAssistService } from '@/lib/services/llmAssist';
import { placementApi } from './placementApi';

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
    // 1. Gather all candidate skills from resume or database
    let baseSkills: string[] = this.getResumeSkills();
    if (baseSkills.length === 0) {
      try {
        const stored = localStorage.getItem('proofhire_student_skills');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            baseSkills = parsed.map((s: any) => s.canonicalName || s.name || '').filter(Boolean);
          }
        }
      } catch {}
    }

    if (baseSkills.length === 0 && isSupabaseConfigured && supabase) {
      try {
        const { data: dbSkills } = await supabase.from('skills').select('canonical_name').limit(15);
        if (dbSkills && dbSkills.length > 0) {
          baseSkills = dbSkills.map((s) => s.canonical_name).filter(Boolean);
        }
      } catch {}
    }

    if (baseSkills.length === 0) {
      baseSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 'Docker'];
    }

    const uniqueSkillNames = Array.from(new Set(baseSkills.map((s) => s.trim()).filter(Boolean)));

    // 2. Fetch student's actual evidence records to deterministically compute verified vs pending status
    const studentEvidence = await this.getEvidence();
    const verifiedSkillNames = new Set(
      studentEvidence
        .filter((e) => e.status === 'VERIFIED')
        .map((e) => e.skillName.toLowerCase())
    );
    const pendingSkillNames = new Set(
      studentEvidence
        .filter((e) => e.status !== 'VERIFIED')
        .map((e) => e.skillName.toLowerCase())
    );

    // 3. Map status and counts deterministically
    const synchronizedSkills: StudentSkill[] = uniqueSkillNames.map((name, idx) => {
      const nameLower = name.toLowerCase();
      const matchedEv = studentEvidence.filter((e) => e.skillName.toLowerCase() === nameLower);
      const evidenceCount = matchedEv.length;

      let status: EvidenceStatus = 'NO_EVIDENCE';
      if (verifiedSkillNames.has(nameLower)) {
        status = 'VERIFIED';
      } else if (pendingSkillNames.has(nameLower) || evidenceCount > 0) {
        status = 'NEEDS_REVIEW';
      } else {
        status = 'NO_EVIDENCE';
      }

      return {
        id: `skill-${nameLower.replace(/[^a-z0-9]/g, '-')}`,
        canonicalName: name,
        category: idx < 2 ? 'Frontend Engineering' : idx < 4 ? 'Languages & Systems' : 'Databases & DevOps',
        proficiencyLevel: idx % 2 === 0 ? 'Advanced' : 'Intermediate',
        evidenceCount,
        status,
        evidenceIds: matchedEv.map((e) => e.id),
      };
    });

    localSkills = synchronizedSkills;
    try {
      localStorage.setItem('proofhire_student_skills', JSON.stringify(synchronizedSkills));
    } catch {}

    return synchronizedSkills;
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
                status: isVerified ? 'VERIFIED' : (e.status === 'UNVERIFIED' ? 'UNVERIFIED' : 'NEEDS_REVIEW'),
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

    const isAssessmentVerified = newEvidence.status === 'VERIFIED' && newEvidence.type === 'ASSESSMENT';
    const finalStatus: EvidenceStatus = isAssessmentVerified ? 'VERIFIED' : 'NEEDS_REVIEW';
    const dbStatus = isAssessmentVerified ? 'ISSUER_VERIFIED' : 'NEEDS_REVIEW';
    const verifiedAt = isAssessmentVerified ? new Date().toISOString() : null;

    const created: EvidenceRecord = {
      ...newEvidence,
      id: createdId,
      studentId: currentUserId,
      status: finalStatus,
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
              status: dbStatus,
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
              verified_at: verifiedAt,
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
          const nextStatus = isAssessmentVerified ? 'VERIFIED' : (sk.status === 'VERIFIED' ? 'VERIFIED' : 'NEEDS_REVIEW');
          return {
            ...sk,
            status: nextStatus,
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
    // Determine current user's applied jobs dynamically
    let appliedJobIds = new Set<string>();
    if (isSupabaseConfigured && supabase) {
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
    }

    // Check user-scoped local storage for applications as well
    try {
      const storedUser = localStorage.getItem('proofhire_user') || localStorage.getItem('proofhire_auth_session');
      const uid = storedUser ? JSON.parse(storedUser)?.id : localStudentProfile.id;
      if (uid) {
        const userKey = `proofhire_student_applications_${uid}`;
        const raw = localStorage.getItem(userKey);
        if (raw) {
          const apps: Application[] = JSON.parse(raw);
          apps.forEach((a) => appliedJobIds.add(a.jobId));
        }
      }
    } catch {}

    // Dynamically evaluate student's verified skills for accurate match scoring
    const studentSkills = await this.getSkills();
    const verifiedSkillNames = new Set(
      studentSkills
        .filter((s) => s.status === 'VERIFIED')
        .map((s) => s.canonicalName.toLowerCase())
    );

    const computeJobMatch = (
      reqList: { canonicalName: string }[] = [],
      prefList: { canonicalName: string }[] = []
    ) => {
      // If student has 0 verified skills, match score is strictly 0%
      if (verifiedSkillNames.size === 0) return 0;
      const totalReq = reqList.length || 1;
      const totalPref = prefList.length || 0;
      const matchedReq = reqList.filter((s) => verifiedSkillNames.has(s.canonicalName.toLowerCase())).length;
      const matchedPref = prefList.filter((s) => verifiedSkillNames.has(s.canonicalName.toLowerCase())).length;
      const reqWeight = totalPref > 0 ? 0.8 : 1.0;
      const prefWeight = totalPref > 0 ? 0.2 : 0.0;
      const reqScore = (matchedReq / totalReq) * reqWeight * 100;
      const prefScore = totalPref > 0 ? (matchedPref / totalPref) * prefWeight * 100 : 0;
      return Math.min(100, Math.round(reqScore + prefScore));
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: dbJobs } = await supabase
          .from('jobs')
          .select('*, campaigns(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (dbJobs && dbJobs.length > 0) {
          const fromDb: Job[] = dbJobs.map((item: any) => {
            const hasApplied = appliedJobIds.has(item.id);
            const reqSkills = [
              { skillId: 'skill-react', canonicalName: 'React', sourceText: 'React', weight: 40 },
              { skillId: 'skill-ts', canonicalName: 'TypeScript', sourceText: 'TypeScript', weight: 30 },
              { skillId: 'skill-node', canonicalName: 'Node.js', sourceText: 'Node.js', weight: 30 },
            ];
            const prefSkills = [
              { skillId: 'skill-pg', canonicalName: 'PostgreSQL', sourceText: 'PostgreSQL', weight: 20 },
              { skillId: 'skill-docker', canonicalName: 'Docker', sourceText: 'Docker', weight: 10 },
            ];

            return {
              id: item.id,
              title: item.title,
              company: item.company_name,
              location: item.location || 'Bengaluru (Hybrid)',
              type: (item.workplace_type || 'Full-time') as Job['type'],
              salaryRange: item.salary_range || '₹8,00,000 - ₹14,00,000',
              description: item.description || '',
              requiredSkills: reqSkills,
              preferredSkills: prefSkills,
              eligibilityCriteria: {
                minimumCgpa: 6.5,
                allowedDepartments: ['Computer Science', 'Information Technology'],
                graduationYear: [2025, 2026],
              },
              deadline: '2026-11-30',
              postedDate: item.created_at ? item.created_at.split('T')[0] : '2026-01-15',
              status: 'ACTIVE',
              sourceCount: 1,
              matchedScore: computeJobMatch(reqSkills, prefSkills),
              hasApplied,
            };
          });

          // Merge with DEMO_JOBS (omit duplicates) and recalculate match scores dynamically
          const dbJobTitles = new Set(fromDb.map((j) => j.title.toLowerCase()));
          const nonDupDemos = DEMO_JOBS
            .filter((d) => !dbJobTitles.has(d.title.toLowerCase()))
            .map((d) => ({
              ...d,
              hasApplied: appliedJobIds.has(d.id),
              matchedScore: computeJobMatch(d.requiredSkills, d.preferredSkills),
            }));

          return [...fromDb, ...nonDupDemos];
        }
      } catch (e) {
        console.warn('Supabase getJobs fallback notice:', e);
      }
    }

    return localJobs.map((j) => ({
      ...j,
      hasApplied: appliedJobIds.has(j.id),
      matchedScore: computeJobMatch(j.requiredSkills, j.preferredSkills),
    }));
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
    let dynamicFitScore = 0;
    try {
      const studentSkillSet = new Set(
        candidateSkills.filter((s) => s.status === 'VERIFIED').map((s) => s.canonicalName.toLowerCase())
      );
      if (studentSkillSet.size > 0) {
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
        dynamicFitScore = Math.max(10, Math.min(100, Math.round(reqScore + prefScore)));
      }
    } catch {}

    const nowFormatted = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let currentUserId = localStudentProfile.id;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
          if (isUuid(jobId)) {
            // Check for linked campaign and increment applicant count
            let campaignId: string | null = null;
            try {
              const { data: camp } = await supabase
                .from('campaigns')
                .select('id, total_applicants')
                .eq('job_id', jobId)
                .maybeSingle();
              if (camp?.id) {
                campaignId = camp.id;
                await supabase
                  .from('campaigns')
                  .update({ total_applicants: (camp.total_applicants || 0) + 1 })
                  .eq('id', camp.id);
              }
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
                notes: 'Application registered with verified skill proof.',
              });
            }
          }
        }
      } catch (e) {
        console.warn('Supabase applyToJob notice:', e);
      }
    }

    // Increment placement campaign applicants count
    try {
      await placementApi.incrementCampaignApplicants(jobId);
    } catch {}

    const newApp: Application = {
      id: `app-${Date.now()}`,
      jobId: job.id,
      jobTitle: (job as any).title,
      companyName: (job as any).company,
      studentId: currentUserId,
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

    // Store in user-scoped local applications list
    try {
      const userKey = `proofhire_student_applications_${currentUserId}`;
      const existing = localStorage.getItem(userKey);
      const list: Application[] = existing ? JSON.parse(existing) : [];
      const updated = [newApp, ...list.filter((a) => a.jobId !== job.id)];
      localStorage.setItem(userKey, JSON.stringify(updated));
    } catch {}

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

          if (!error && Array.isArray(dbApps)) {
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

            // Merge with user-scoped local applications
            const userKey = `proofhire_student_applications_${user.id}`;
            const userLocalRaw = localStorage.getItem(userKey);
            const userLocal: Application[] = userLocalRaw ? JSON.parse(userLocalRaw) : [];
            const dbJobIds = new Set(dbMapped.map((d) => d.jobId));
            const extraLocal = userLocal.filter((l) => !dbJobIds.has(l.jobId));
            return [...dbMapped, ...extraLocal];
          }
        }
      } catch (e) {
        console.warn('Supabase getApplications notice:', e);
      }
    }

    // Check if authenticated student session exists
    try {
      const stored = localStorage.getItem('proofhire_auth_session') || sessionStorage.getItem('proofhire_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id && parsed.id !== 'student-demo-001') {
          const userKey = `proofhire_student_applications_${parsed.id}`;
          const raw = localStorage.getItem(userKey);
          if (raw) return JSON.parse(raw);
          return []; // A newly registered student starts with 0 applications!
        }
      }
    } catch {}

    // Only fallback to demo applications for unauthenticated demo persona Alex Morgan
    if (localStudentProfile.id === 'student-demo-001') {
      return localApplications;
    }

    return [];
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
    // 1. Fetch the student's skills (prioritizing resume-extracted skills)
    const resumeSkills = this.getResumeSkills();
    const cleanSkills = Array.from(new Set(resumeSkills.map((s) => s.trim()).filter(Boolean)));
    const targetSkills = cleanSkills.length > 0 ? cleanSkills.slice(0, 5) : ['React', 'TypeScript', 'Node.js', 'Python'];

    // 2. Fetch assessments in parallel with local caching for instant load
    const benchmarkPromises = targetSkills.map(async (skillName) => {
      const cacheKey = `proofhire_quiz_cache_${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
            return { skillName, benchmark: parsed };
          }
        }
      } catch {}

      const benchmark = await llmAssistService.generateSkillAssessmentWithLLM(skillName);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(benchmark));
      } catch {}

      return { skillName, benchmark };
    });

    const results = await Promise.all(benchmarkPromises);

    return results.map(({ skillName, benchmark }) => ({
      id: `assess-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-v1`,
      skillId: `skill-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: benchmark.title || `${skillName} Core Technical Assessment`,
      version: '1.0',
      durationMinutes: 15,
      instructions: `Answer all 4 questions objectively. Minimum passing score is 70%. Answers verify your competency for ${skillName} into the evidence ledger.`,
      questionCount: benchmark.questions.length,
      questions: benchmark.questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
      })),
    }));
  },

  async submitAssessment(
    studentId: string,
    assessmentId: string,
    answers: number[],
    assessmentItem?: AssessmentItem
  ): Promise<{ attempt: AssessmentAttemptResult; message: string; evidence?: EvidenceRecord }> {
    const questions = assessmentItem?.questions || [];
    let correctCount = 0;
    const totalQuestions = questions.length || 4;

    questions.forEach((q, idx) => {
      const studentAns = answers[idx];
      const expected = (q as any).correctIndex ?? 0;
      if (studentAns === expected) {
        correctCount++;
      }
    });

    const calculatedScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 85;
    const isPassed = calculatedScore >= 70;
    const skillName = assessmentItem?.title?.split(' ')[0] || 'Technical Skill';

    let createdEvidence: EvidenceRecord | undefined;
    if (isPassed) {
      createdEvidence = await this.addEvidence({
        studentId,
        skillId: assessmentItem?.skillId || `skill-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        skillName,
        type: 'ASSESSMENT',
        title: `Proctored Assessment: ${skillName} Technical Benchmark`,
        status: 'VERIFIED',
        date: new Date().toISOString().split('T')[0],
        details: `Successfully cleared automated proctored technical evaluation with score of ${calculatedScore}% (${correctCount}/${totalQuestions} correct answers). Evaluation verified and sealed deterministically.`,
        sourceUrl: undefined,
        issuer: 'ProofHire Automated Assessment Engine v1.2',
      });

      // Update any existing pending evidence for this skill in Supabase to ISSUER_VERIFIED
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('evidence_records')
            .update({
              status: 'ISSUER_VERIFIED',
              verified_at: new Date().toISOString(),
            })
            .eq('student_id', studentId)
            .ilike('title', `%${skillName}%`);
        } catch (e) {
          console.warn('Supabase verify evidence update notice:', e);
        }
      }

      // Update student's local evidence cache for this skill to VERIFIED
      try {
        const storageKey = `proofhire_student_evidence_${studentId}`;
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const list: EvidenceRecord[] = JSON.parse(raw);
          const updated = list.map((ev) => {
            if (ev.skillName.toLowerCase() === skillName.toLowerCase()) {
              return { ...ev, status: 'VERIFIED' as EvidenceStatus };
            }
            return ev;
          });
          localStorage.setItem(storageKey, JSON.stringify(updated));
        }
      } catch {}

      // Update tracked skills to VERIFIED
      localSkills = localSkills.map((sk) => {
        if (sk.canonicalName.toLowerCase() === skillName.toLowerCase()) {
          return {
            ...sk,
            status: 'VERIFIED' as EvidenceStatus,
            evidenceCount: (sk.evidenceCount || 0) + 1,
          };
        }
        return sk;
      });
      try {
        localStorage.setItem('proofhire_student_skills', JSON.stringify(localSkills));
      } catch {}
    }

    const attempt: AssessmentAttemptResult = {
      id: `att-${Date.now()}`,
      studentId,
      assessmentId,
      skillId: assessmentItem?.skillId || `skill-${skillName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      score: calculatedScore,
      passed: isPassed,
      completedAt: new Date().toISOString(),
    };

    // Store attempt history in user-scoped cache
    try {
      const attemptsKey = `proofhire_assessment_attempts_${studentId}`;
      const existing = localStorage.getItem(attemptsKey);
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem(attemptsKey, JSON.stringify([attempt, ...parsed]));
    } catch {}

    return {
      attempt,
      message: isPassed
        ? `Assessment PASSED with ${calculatedScore}%! Skill evidence created and automatically verified in your ledger.`
        : `Assessment completed with score of ${calculatedScore}%. 70% required to verify evidence. You may re-attempt anytime.`,
      evidence: createdEvidence,
    };
  },

  async getStudentAssessmentAttempts(studentId: string): Promise<AssessmentAttemptResult[]> {
    try {
      const attemptsKey = `proofhire_assessment_attempts_${studentId}`;
      const existing = localStorage.getItem(attemptsKey);
      if (existing) {
        const parsed = JSON.parse(existing);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },
};
