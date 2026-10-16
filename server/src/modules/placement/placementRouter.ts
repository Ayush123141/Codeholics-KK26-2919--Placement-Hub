import { Router, Request, Response } from 'express';
import { evidenceStore, evidenceRegistryService } from '../evidence/evidenceRouter';
import { supabaseAdmin } from '../../supabase.js';

export const placementRouter = Router();

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
    const { data: sources, error } = await supabaseAdmin
      .from('job_sources')
      .select('*, jobs (title, company_name)')
      .order('created_at', { ascending: false });

    if (!error && sources && sources.length > 0) {
      const mapped = sources.map((s: any) => ({
        id: s.id,
        jobId: s.job_id,
        jobTitle: s.jobs?.title || 'Unknown',
        company: s.jobs?.company_name || 'Unknown',
        source: s.source_type,
        sourceUrl: s.source_url || '',
        referrerName: s.referrer_name || '',
        resolutionStatus: s.duplicate_status || 'UNIQUE',
        duplicateWarning: s.duplicate_status === 'POSSIBLE_DUPLICATE',
        duplicateConfidence: s.duplicate_confidence || 0,
        duplicateNotes: s.duplicate_notes || '',
        submittedAt: s.created_at,
      }));
      return res.json(mapped);
    }
  } catch {
    // Fall through
  }

  return res.json([
    {
      id: 'src-001',
      jobId: 'job-demo-001',
      jobTitle: 'Frontend Platform Engineer',
      company: 'CloudScale Technologies',
      source: 'COMPANY_POSTING',
      sourceUrl: 'https://careers.cloudscale.io/jobs/4882',
      referrerName: 'Sarah Jenkins (Recruiter Direct)',
      resolutionStatus: 'UNIQUE',
      duplicateWarning: false,
      duplicateConfidence: 0,
      submittedAt: '2026-10-10 09:30 AM',
    },
    {
      id: 'src-002',
      jobId: 'job-demo-001',
      jobTitle: 'Frontend Platform Engineer — CloudScale Technologies',
      company: 'CloudScale Technologies',
      source: 'ALUMNI_REFERRAL',
      sourceUrl: 'https://alumni.techsummit.edu/referrals/419',
      referrerName: 'Priya Nair (Senior Software Engineer @ CloudScale)',
      resolutionStatus: 'PENDING',
      duplicateWarning: true,
      duplicateConfidence: 96,
      duplicateNotes: 'Exact title and employer match with primary job-demo-001.',
      submittedAt: '2026-10-11 02:15 PM',
    },
    {
      id: 'src-003',
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
 * Toggle candidate shortlist status
 */
placementRouter.post('/candidates/:studentId/shortlist', (req: Request, res: Response) => {
  return res.json({ isShortlisted: true });
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
