import { Router, Request, Response } from 'express';
import { z } from 'zod';
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
 * Placement Officer reviews and explicitly approves & releases the verified candidate shortlist to the company recruiter.
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
      message: 'Shortlist successfully approved and released to company recruiters.',
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
 * Returns current shortlist sharing status for a given job / campaign
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

export { inMemoryShortlists };
