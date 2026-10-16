import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { evidenceStore, evidenceRegistryService } from '../evidence/evidenceRouter';
import { supabaseAdmin } from '../../supabase.js';

export const placementRouter = Router();

// In-memory shortlist state for fallback/mock mode if Supabase table is offline or in local demo
interface ShortlistRecord {
  studentId: string;
  jobId: string;
  isShortlisted: boolean;
  sharedWithCompany: boolean;
  releasedAt?: string;
  releasedBy?: string;
}

const inMemoryShortlists = new Map<string, ShortlistRecord>([
  ['student-001', { studentId: 'student-001', jobId: 'job-demo-001', isShortlisted: true, sharedWithCompany: true, releasedAt: new Date().toISOString(), releasedBy: 'Dr. Ramesh Sharma (Placement Cell)' }],
  ['student-002', { studentId: 'student-002', jobId: 'job-demo-001', isShortlisted: true, sharedWithCompany: true, releasedAt: new Date().toISOString(), releasedBy: 'Dr. Ramesh Sharma (Placement Cell)' }],
  ['student-003', { studentId: 'student-003', jobId: 'job-demo-001', isShortlisted: false, sharedWithCompany: false }],
  ['student-004', { studentId: 'student-004', jobId: 'job-demo-001', isShortlisted: false, sharedWithCompany: false }],
  ['student-005', { studentId: 'student-005', jobId: 'job-demo-001', isShortlisted: false, sharedWithCompany: false }],
]);

/**
 * GET /api/placement/campaigns
 * List placement campaigns
 */
placementRouter.get('/campaigns', async (_req: Request, res: Response) => {
  try {
    const { data: campaigns, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && campaigns && campaigns.length > 0) {
      return res.json(campaigns);
    }
  } catch {
    // Fall through to demo
  }

  // Demo campaigns
  return res.json([
    {
      id: 'campaign-2026-cs-fullstack',
      title: 'CS Full-Stack 2026 Placement Drive',
      status: 'ACTIVE',
      eligibility: { departments: ['Computer Science', 'IT'], minCgpa: 6.5, graduationYear: [2026] },
      startDate: '2026-09-01',
      endDate: '2026-12-31',
      shortlistedCount: 3,
      interviewCount: 1,
      offersCount: 0,
      totalApplicants: 18,
    },
  ]);
});

/**
 * POST /api/placement/campaigns
 */
placementRouter.post('/campaigns', (req: Request, res: Response) => {
  const body = req.body;
  const campaign = {
    id: `campaign-${Date.now()}`,
    ...body,
    shortlistedCount: 0,
    interviewCount: 0,
    offersCount: 0,
    totalApplicants: 0,
  };
  return res.status(201).json(campaign);
});

/**
 * GET /api/placement/jobs/sources
 * List job sources with duplicate detection info
 */
placementRouter.get('/jobs/sources', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('job_sources')
      .select('*, jobs(title, company_name)')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped = data.map((s: any) => ({
        id: s.id,
        jobId: s.job_id,
        jobTitle: s.jobs?.title || 'Unknown Role',
        company: s.jobs?.company_name || 'Unknown Company',
        source: s.source_type,
        sourceUrl: s.source_url,
        referrerName: s.referrer_name,
        referrerEmail: s.referrer_email,
        resolutionStatus: s.duplicate_status === 'MERGED' ? 'APPROVED_MERGE' : s.duplicate_status === 'UNIQUE' ? 'REJECTED_SEPARATE' : 'PENDING',
        duplicateWarning: s.duplicate_status === 'POSSIBLE_DUPLICATE' || s.duplicate_status === 'CONFIRMED_DUPLICATE',
        duplicateConfidence: Math.round((s.duplicate_confidence || 0) * 100),
        duplicateNotes: s.duplicate_notes,
        submittedAt: s.created_at,
      }));
      return res.json(mapped);
    }
  } catch {
    // Fall through to demo
  }

  // Demo sources
  return res.json([
    {
      id: 'js-demo-001',
      jobId: 'job-demo-001',
      jobTitle: 'Frontend Platform Engineer',
      company: 'CloudScale Technologies',
      source: 'COMPANY_POSTING',
      sourceUrl: 'https://careers.cloudscale.io/jobs/fe-platform-2026',
      referrerName: 'Direct Campus Drive API',
      resolutionStatus: 'PENDING',
      duplicateWarning: false,
      duplicateConfidence: 0,
      duplicateNotes: null,
      submittedAt: '2026-10-10 10:00 AM',
    },
    {
      id: 'js-demo-002',
      jobId: 'job-demo-001',
      jobTitle: 'React / Frontend Developer (CloudScale Referral)',
      company: 'CloudScale Technologies',
      source: 'ALUMNI_REFERRAL',
      sourceUrl: 'https://careers.cloudscale.io/jobs/fe-platform-2026',
      referrerName: 'Vikas Gupta (Class of 2023)',
      referrerEmail: 'vikas.g@alumni.techsummit.edu',
      resolutionStatus: 'PENDING',
      duplicateWarning: true,
      duplicateConfidence: 96,
      duplicateNotes: 'Exact match on canonical source URL and normalized title + company.',
      submittedAt: '2026-10-11 02:30 PM',
    },
    {
      id: 'js-demo-003',
      jobId: 'job-demo-001',
      jobTitle: 'Software Engineer - Frontend Platform (CloudScale)',
      company: 'CloudScale Technologies',
      source: 'API_INGESTION',
      sourceUrl: 'https://api.npx-placement.gov.in/v2/vacancies/9921',
      referrerName: 'Automated Job Ingestion Cron',
      resolutionStatus: 'PENDING',
      duplicateWarning: true,
      duplicateConfidence: 91,
      duplicateNotes: 'Normalized title matches existing posting.',
      submittedAt: '2026-10-12 04:00 AM',
    },
  ]);
});

/**
 * POST /api/placement/jobs/sources/:sourceId/resolve
 * Resolve a duplicate job source
 */
placementRouter.post('/jobs/sources/:sourceId/resolve', async (req: Request, res: Response) => {
  const { sourceId } = req.params;
  const { resolution } = req.body;

  try {
    const { data, error } = await supabaseAdmin
      .from('job_sources')
      .update({
        duplicate_status: resolution === 'APPROVED_MERGE' ? 'MERGED' : 'UNIQUE',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', sourceId)
      .select()
      .single();

    if (!error && data) {
      return res.json({
        id: data.id,
        resolutionStatus: resolution,
        duplicateWarning: false,
      });
    }
  } catch {
    // Fall through
  }

  return res.json({
    id: sourceId,
    resolutionStatus: resolution,
    duplicateWarning: false,
  });
});

/**
 * POST /api/placement/candidates/:studentId/shortlist
 * Toggles a candidate's placement shortlist status
 */
placementRouter.post('/candidates/:studentId/shortlist', async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { isShortlisted } = req.body || {};

  try {
    const existing = inMemoryShortlists.get(studentId) || {
      studentId,
      jobId: 'job-demo-001',
      isShortlisted: false,
      sharedWithCompany: false,
    };

    const nextShortlisted = typeof isShortlisted === 'boolean' ? isShortlisted : !existing.isShortlisted;
    existing.isShortlisted = nextShortlisted;
    if (!nextShortlisted) {
      existing.sharedWithCompany = false;
    }
    inMemoryShortlists.set(studentId, existing);

    // Also attempt Supabase update if match_results table exists
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    if (isUuid(studentId)) {
      try {
        await supabaseAdmin
          .from('match_results')
          .update({
            is_shortlisted: nextShortlisted,
            updated_at: new Date().toISOString(),
          })
          .eq('student_id', studentId);
      } catch {
        // Graceful fallback to in-memory state
      }
    }

    return res.json({
      success: true,
      studentId,
      isShortlisted: existing.isShortlisted,
      sharedWithCompany: existing.sharedWithCompany,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const releaseShortlistSchema = z.object({
  jobId: z.string().default('job-demo-001'),
  campaignId: z.string().optional(),
  releasedBy: z.string().default('Dr. Ramesh Sharma (Placement Cell)'),
  notes: z.string().optional(),
});

/**
 * POST /api/placement/shortlist/release
 * Controlled Shortlist Sharing Gate:
 * Placement Officer reviews and explicitly approves & releases the verified candidate shortlist.
 */
placementRouter.post('/shortlist/release', async (req: Request, res: Response) => {
  try {
    const { jobId, releasedBy, notes } = releaseShortlistSchema.parse(req.body);

    const releasedStudentIds: string[] = [];
    const timestamp = new Date().toISOString();

    for (const [sId, rec] of inMemoryShortlists.entries()) {
      if (rec.jobId === jobId && rec.isShortlisted) {
        rec.sharedWithCompany = true;
        rec.releasedAt = timestamp;
        rec.releasedBy = releasedBy;
        releasedStudentIds.push(sId);
      }
    }

    // Attempt Supabase audit and update
    try {
      await supabaseAdmin
        .from('campaigns')
        .update({
          is_shared_with_company: true,
          updated_at: timestamp,
        })
        .eq('id', jobId);
    } catch {
      // In-memory fallback
    }

    return res.json({
      success: true,
      message: 'Shortlist successfully approved and released.',
      jobId,
      releasedCount: releasedStudentIds.length,
      releasedStudentIds,
      releasedBy,
      releasedAt: timestamp,
      notes,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', issues: err.issues });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/placement/shortlist/status
 * Returns current shortlist status for a given job / campaign
 */
placementRouter.get('/shortlist/status', (req: Request, res: Response) => {
  const jobId = (req.query.jobId as string) || 'job-demo-001';
  const candidates: ShortlistRecord[] = [];

  for (const rec of inMemoryShortlists.values()) {
    if (rec.jobId === jobId) {
      candidates.push(rec);
    }
  }

  const shortlisted = candidates.filter((c) => c.isShortlisted);
  const released = shortlisted.filter((c) => c.sharedWithCompany);

  return res.json({
    success: true,
    jobId,
    totalEvaluated: candidates.length,
    shortlistedCount: shortlisted.length,
    releasedCount: released.length,
    isFullyReleased: shortlisted.length > 0 && shortlisted.length === released.length,
    candidates,
  });
});

/**
 * GET /api/placement/evidence/pending
 * Get evidence items pending review
 */
placementRouter.get('/evidence/pending', (_req: Request, res: Response) => {
  const pending = evidenceStore.filter(
    (e) => e.reviewStatus === 'NEEDS_REVIEW' || e.reviewStatus === 'EVIDENCE_FOUND'
  );
  return res.json({
    success: true,
    count: pending.length,
    evidence: pending,
  });
});

export { inMemoryShortlists };
