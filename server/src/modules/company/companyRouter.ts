import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../../supabase.js';

export const companyRouter = Router();

/**
 * GET /api/company/vacancies
 * List vacancies for the recruiter's company
 */
companyRouter.get('/vacancies', async (req: Request, res: Response) => {
  try {
    const companyId = req.query.companyId as string;

    let query = supabaseAdmin
      .from('jobs')
      .select('*, job_sources(*), job_skills(*, skills(*))')
      .order('created_at', { ascending: false });

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: jobs, error } = await query;

    if (!error && jobs && jobs.length > 0) {
      const mapped = jobs.map((j: any) => ({
        id: j.id,
        title: j.title,
        company: j.company_name,
        location: j.location,
        type: j.employment_type || 'Full-time',
        salaryRange: j.salary_range || 'Competitive',
        description: j.description || '',
        requiredSkills: [],
        preferredSkills: [],
        eligibilityCriteria: {
          minimumCgpa: 6.5,
          allowedDepartments: ['Computer Science', 'IT'],
          graduationYear: [2025, 2026],
        },
        deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        postedDate: j.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: j.is_active ? 'ACTIVE' : 'CLOSED',
        sourceCount: Array.isArray(j.job_sources) ? j.job_sources.length : 0,
      }));
      return res.json(mapped);
    }
  } catch {
    // Fall through
  }

  return res.json([]);
});

/**
 * POST /api/company/vacancies
 * Create a new job vacancy
 */
companyRouter.post('/vacancies', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    const { data: newJob, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        title: body.title,
        company_name: body.company || 'Unknown Company',
        company_id: body.companyId || 'b0000000-0000-0000-0000-000000000001',
        location: body.location || 'Remote',
        workplace_type: body.type || 'Remote',
        employment_type: body.type || 'Full-time',
        description: body.description || '',
        salary_range: body.salaryRange || 'Competitive',
        is_active: true,
      })
      .select()
      .single();

    if (!error && newJob) {
      return res.status(201).json({
        id: newJob.id,
        title: newJob.title,
        company: newJob.company_name,
        location: newJob.location,
        type: newJob.employment_type,
        salaryRange: newJob.salary_range,
        description: newJob.description,
        postedDate: newJob.created_at?.split('T')[0],
        status: 'ACTIVE',
        sourceCount: 1,
      });
    }
  } catch {
    // Fall through
  }

  // Fallback: return the submitted data with generated ID
  const created = {
    id: `job-${Date.now()}`,
    ...req.body,
    postedDate: new Date().toISOString().split('T')[0],
    sourceCount: 1,
  };
  return res.status(201).json(created);
});

let candidateList = [
  {
    studentId: 'student-demo-001',
    studentName: 'Alex Morgan',
    studentEmail: 'alex.morgan@techsummit.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    department: 'Computer Science',
    cgpa: 8.85,
    fitScore: 82,
    matchedSkills: ['React', 'TypeScript'],
    partialEvidenceSkills: ['Node.js'],
    noEvidenceSkills: ['PostgreSQL'],
    preferredGaps: ['PostgreSQL'],
    explanation: 'High confidence on required skills: Proctored React benchmark (94%), capstone project rubric (4.8/5.0), and TypeScript proctored test (88%). Node.js has verified project code.',
    evidenceRefs: ['ev-001', 'ev-002', 'ev-003'],
    policyVersion: 'v1.0-deterministic-80-20',
    isShortlisted: true,
    assessmentScore: 91,
    applicationStage: 'INTERVIEW',
  },
  {
    studentId: 'student-demo-002',
    studentName: 'Rohan Deshmukh',
    studentEmail: 'rohan.d@techsummit.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
    department: 'Computer Science',
    cgpa: 9.12,
    fitScore: 78,
    matchedSkills: ['React', 'Node.js'],
    partialEvidenceSkills: ['TypeScript'],
    noEvidenceSkills: ['PostgreSQL'],
    preferredGaps: ['TypeScript', 'PostgreSQL'],
    explanation: 'Demonstrated strong React coursework and Node.js backend evaluation. TypeScript is partially proven via repository audit.',
    evidenceRefs: ['ev-rohan-01', 'ev-rohan-02'],
    policyVersion: 'v1.0-deterministic-80-20',
    isShortlisted: true,
    assessmentScore: 85,
    applicationStage: 'SHORTLISTED',
  },
  {
    studentId: 'student-demo-003',
    studentName: 'Ananya Iyer',
    studentEmail: 'ananya.iyer@techsummit.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    department: 'Information Technology',
    cgpa: 8.40,
    fitScore: 71,
    matchedSkills: ['React'],
    partialEvidenceSkills: ['TypeScript', 'Node.js'],
    noEvidenceSkills: ['PostgreSQL'],
    preferredGaps: ['PostgreSQL'],
    explanation: 'Verified React project and certificate. TypeScript repository exhibits basic usage.',
    evidenceRefs: ['ev-ananya-01'],
    policyVersion: 'v1.0-deterministic-80-20',
    isShortlisted: false,
    assessmentScore: 74,
    applicationStage: 'APPLIED',
  },
];

/**
 * GET /api/company/candidates
 * List shared candidate shortlist for the recruiter
 */
companyRouter.get('/candidates', (_req: Request, res: Response) => {
  return res.json(candidateList);
});

/**
 * POST /api/company/candidates/:candidateId/schedule-interview
 * Schedule an interview with a candidate
 */
companyRouter.post('/candidates/:candidateId/schedule-interview', (req: Request, res: Response) => {
  const { candidateId } = req.params;
  const { interviewDate, notes } = req.body;

  const cand = candidateList.find((c) => c.studentId === candidateId);
  if (cand) {
    cand.applicationStage = 'INTERVIEW';
  }

  return res.json({
    success: true,
    candidateId,
    interviewDate,
    notes,
    scheduledAt: new Date().toISOString(),
  });
});
