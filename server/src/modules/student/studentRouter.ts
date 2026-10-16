import { Router, Request, Response } from 'express';
import { evidenceRegistryService, evidenceStore } from '../evidence/evidenceRouter';
import { getAllCanonicalSkills } from '../skills/skillCatalogue';
import { supabaseAdmin } from '../../supabase.js';

export const studentRouter = Router();

/**
 * GET /api/student/profile
 * Returns the student profile. If auth token present, fetch from Supabase profiles.
 * Otherwise returns a default demo student.
 */
studentRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    // If we have a student ID in query or from token
    const studentId = (req.query.studentId as string) || 'student-001';
    
    // Try Supabase lookup
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', studentId)
      .maybeSingle();

    if (!error && profile) {
      return res.json({
        id: profile.id,
        name: profile.full_name || 'Student',
        email: profile.email || '',
        role: profile.role || 'STUDENT',
        department: profile.department || 'Computer Science',
        graduationYear: profile.cohort_year || 2026,
        cgpa: profile.cgpa || 8.5,
        githubUsername: profile.github_username || '',
      });
    }
  } catch {
    // Fall through to demo
  }

  // Default demo profile
  return res.json({
    id: 'student-001',
    name: 'Alex Chen',
    email: 'alex.chen@techsummit.edu',
    role: 'STUDENT',
    department: 'Computer Science',
    graduationYear: 2026,
    cgpa: 8.7,
    githubUsername: 'alexchen-dev',
    avatarUrl: '',
  });
});

/**
 * PUT /api/student/profile
 */
studentRouter.put('/profile', (req: Request, res: Response) => {
  // Accept updates and return merged profile
  const updates = req.body;
  return res.json({
    id: 'student-001',
    name: updates.name || 'Alex Chen',
    email: updates.email || 'alex.chen@techsummit.edu',
    role: 'STUDENT',
    department: updates.department || 'Computer Science',
    graduationYear: updates.graduationYear || 2026,
    cgpa: updates.cgpa || 8.7,
    githubUsername: updates.githubUsername || 'alexchen-dev',
    ...updates,
  });
});

/**
 * GET /api/student/skills
 * Returns student skills with evidence counts
 */
studentRouter.get('/skills', (req: Request, res: Response) => {
  const studentId = (req.query.studentId as string) || 'student-001';
  const allSkills = getAllCanonicalSkills();
  const studentEvidence = evidenceRegistryService.getStudentEvidence(studentId);

  const skills = allSkills
    .map((skill) => {
      const evidences = studentEvidence.filter(
        (e) => e.skillId.toLowerCase() === skill.id.toLowerCase()
      );
      if (evidences.length === 0) return null;

      const bestEvidence = evidences.reduce((best, e) =>
        (e.score || 0) > (best.score || 0) ? e : best
      );

      return {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        level: (bestEvidence.score || 0) >= 85 ? 'Advanced' :
               (bestEvidence.score || 0) >= 60 ? 'Intermediate' : 'Beginner',
        verificationStatus: bestEvidence.reviewStatus === 'ISSUER_VERIFIED' ? 'VERIFIED' :
                           bestEvidence.reviewStatus === 'MANUALLY_REVIEWED' ? 'VERIFIED' :
                           bestEvidence.reviewStatus === 'EVIDENCE_FOUND' ? 'PENDING' : 'UNVERIFIED',
        endorsements: evidences.length,
        evidenceCount: evidences.length,
      };
    })
    .filter(Boolean);

  return res.json(skills);
});

/**
 * GET /api/student/evidence
 * Returns all evidence records for a student
 */
studentRouter.get('/evidence', (req: Request, res: Response) => {
  const studentId = (req.query.studentId as string) || 'student-001';
  const records = evidenceRegistryService.getStudentEvidence(studentId);

  // Map to frontend-expected EvidenceRecord shape
  const evidence = records.map((r) => ({
    id: r.id,
    type: r.sourceType === 'assessment' ? 'ASSESSMENT' :
          r.sourceType === 'project_eval' ? 'PROJECT' :
          r.sourceType === 'certificate' ? 'CERTIFICATION' :
          r.sourceType === 'github_repo' ? 'GITHUB' : 'PEER_REVIEW',
    title: r.title,
    description: r.description,
    skillId: r.skillId,
    issuedBy: r.reviewedBy || 'ProofHire System',
    issuedAt: r.recordedAt,
    verificationStatus: r.reviewStatus === 'ISSUER_VERIFIED' ? 'VERIFIED' :
                        r.reviewStatus === 'MANUALLY_REVIEWED' ? 'VERIFIED' :
                        r.reviewStatus === 'EVIDENCE_FOUND' ? 'PENDING' : 'PENDING',
    score: r.score,
    evidenceUrl: r.evidenceUrl || '',
    metadata: r.metadata || {},
  }));

  return res.json(evidence);
});

/**
 * POST /api/student/evidence
 * Add new evidence for a student
 */
studentRouter.post('/evidence', (req: Request, res: Response) => {
  const body = req.body;
  const registered = evidenceRegistryService.registerEvidence({
    studentId: body.studentId || 'student-001',
    skillId: body.skillId || 'skill-general',
    sourceType: body.type?.toLowerCase() || body.sourceType || 'manual',
    title: body.title || 'Untitled Evidence',
    description: body.description || '',
    score: body.score,
    evidenceUrl: body.evidenceUrl,
    reviewStatus: 'NEEDS_REVIEW',
  });

  return res.status(201).json({
    id: registered.id,
    type: body.type || registered.sourceType,
    title: registered.title,
    description: registered.description,
    skillId: registered.skillId,
    issuedBy: 'ProofHire System',
    issuedAt: registered.recordedAt,
    verificationStatus: 'PENDING',
    score: registered.score,
  });
});

/**
 * GET /api/student/projects
 * Returns student projects
 */
studentRouter.get('/projects', (req: Request, res: Response) => {
  const studentId = (req.query.studentId as string) || 'student-001';
  const projectEvidence = evidenceRegistryService
    .getStudentEvidence(studentId)
    .filter((e) => e.sourceType === 'project_eval' || e.sourceType === 'github_repo');

  const projects = projectEvidence.map((e) => ({
    id: e.id,
    name: e.title,
    description: e.description,
    techStack: [e.skillId],
    githubUrl: e.evidenceUrl || '',
    score: e.score,
    status: e.reviewStatus === 'ISSUER_VERIFIED' || e.reviewStatus === 'MANUALLY_REVIEWED' ? 'COMPLETED' : 'IN_PROGRESS',
  }));

  return res.json(projects);
});

/**
 * GET /api/student/applications
 * Returns student's job applications
 */
studentRouter.get('/applications', async (req: Request, res: Response) => {
  try {
    const studentId = (req.query.studentId as string) || 'student-001';

    const { data: apps, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        jobs (title, company_name, location, workplace_type),
        application_events (*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (!error && apps && apps.length > 0) {
      const mapped = apps.map((app: any) => ({
        id: app.id,
        jobId: app.job_id,
        jobTitle: app.jobs?.title || 'Unknown Job',
        companyName: app.jobs?.company_name || 'Unknown Company',
        studentId: app.student_id,
        studentName: 'Alex Chen',
        appliedAt: app.created_at,
        currentStage: app.current_stage,
        fitScore: 85,
        events: (app.application_events || []).map((ev: any) => ({
          id: ev.id,
          applicationId: ev.application_id,
          fromStage: ev.from_stage,
          toStage: ev.to_stage,
          timestamp: ev.created_at,
          actorName: 'System',
          actorRole: 'SYSTEM',
          notes: ev.notes || '',
        })),
      }));
      return res.json(mapped);
    }
  } catch {
    // Fall through
  }

  // Fallback: return demo applications for student
  return res.json([
    {
      id: 'app-001',
      jobId: 'job-demo-001',
      jobTitle: 'Frontend Platform Engineer',
      companyName: 'CloudScale Technologies',
      studentId: 'student-demo-001',
      studentName: 'Alex Morgan',
      appliedAt: '2026-10-11 11:20 AM',
      currentStage: 'INTERVIEW',
      fitScore: 82,
      interviewDate: '2026-10-22 at 03:00 PM IST',
      interviewNotes: 'Round 1: System Architecture & Reusable Component Design with Senior Architect.',
      events: [
        {
          id: 'ev-app-1',
          applicationId: 'app-001',
          toStage: 'APPLIED',
          timestamp: '2026-10-11 11:20 AM',
          actorName: 'Alex Morgan',
          actorRole: 'STUDENT',
          notes: 'Application submitted with verified evidence summary.',
        },
        {
          id: 'ev-app-2',
          applicationId: 'app-001',
          fromStage: 'APPLIED',
          toStage: 'SHORTLISTED',
          timestamp: '2026-10-13 09:30 AM',
          actorName: 'Dr. Ramesh Sharma',
          actorRole: 'PLACEMENT_OFFICER',
          notes: 'Automated policy matched top 5% verified evidence fit score.',
        },
        {
          id: 'ev-app-3',
          applicationId: 'app-001',
          fromStage: 'SHORTLISTED',
          toStage: 'INTERVIEW',
          timestamp: '2026-10-14 04:15 PM',
          actorName: 'Sarah Jenkins',
          actorRole: 'COMPANY_RECRUITER',
          notes: 'Interview scheduled: Component Architecture Deep-Dive.',
        },
      ],
    },
    {
      id: 'app-002',
      jobId: 'job-demo-002',
      jobTitle: 'Full Stack Systems Engineer',
      companyName: 'Nexus FinTech Labs',
      studentId: 'student-demo-001',
      studentName: 'Alex Morgan',
      appliedAt: '2026-10-12 02:45 PM',
      currentStage: 'TECHNICAL_ASSESSMENT',
      fitScore: 78,
      events: [
        {
          id: 'ev-app-4',
          applicationId: 'app-002',
          toStage: 'APPLIED',
          timestamp: '2026-10-12 02:45 PM',
          actorName: 'Alex Morgan',
          actorRole: 'STUDENT',
          notes: 'Application submitted for Full Stack Systems Engineer.',
        },
        {
          id: 'ev-app-5',
          applicationId: 'app-002',
          fromStage: 'APPLIED',
          toStage: 'TECHNICAL_ASSESSMENT',
          timestamp: '2026-10-15 10:00 AM',
          actorName: 'Nexus FinTech Automated System',
          actorRole: 'SYSTEM',
          notes: 'Invited to take Node.js & PostgreSQL coding assessment.',
        },
      ],
    },
  ]);
});
