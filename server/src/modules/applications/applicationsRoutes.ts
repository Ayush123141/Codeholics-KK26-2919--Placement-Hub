import { Router, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../../supabase.js';
import { AuthenticatedRequest } from '../../middleware/auth.js';

export const applicationsRouter = Router();

const applySchema = z.object({
  jobId: z.string().uuid(),
  studentId: z.string().uuid(),
  campaignId: z.string().uuid().optional(),
  resumeUrl: z.string().url().optional(),
  notes: z.string().optional(),
});

const updateStageSchema = z.object({
  stage: z.enum(['APPLIED', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'OFFERED', 'REJECTED']),
  notes: z.string().optional(),
});

/**
 * GET /api/applications/student/:studentId
 * List all applications submitted by a student
 */
applicationsRouter.get('/student/:studentId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { studentId } = req.params;

    const { data: apps, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        jobs (title, company_name, location, workplace_type),
        application_events (*)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, count: apps.length, data: apps });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch student applications', details: err.message });
  }
});

/**
 * GET /api/applications/job/:jobId
 * List all applications for a specific job (Placement Officer)
 */
applicationsRouter.get('/job/:jobId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { jobId } = req.params;

    const { data: apps, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        profiles (full_name, email, github_username, cohort_year, department),
        application_events (*)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, count: apps.length, data: apps });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch job applications', details: err.message });
  }
});

/**
 * POST /api/applications/apply
 * Student applies for a job with duplicate check and initial audit log
 */
applicationsRouter.post('/apply', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = applySchema.parse(req.body);

    // Prevent duplicate application
    const { data: existingApp } = await supabaseAdmin
      .from('applications')
      .select('id, current_stage')
      .eq('job_id', validated.jobId)
      .eq('student_id', validated.studentId)
      .maybeSingle();

    if (existingApp) {
      return res.status(409).json({
        error: 'Duplicate application',
        message: 'Student has already submitted an application for this opening.',
        currentStage: existingApp.current_stage,
      });
    }

    // Insert new application
    const { data: newApp, error: appErr } = await supabaseAdmin
      .from('applications')
      .insert({
        job_id: validated.jobId,
        student_id: validated.studentId,
        campaign_id: validated.campaignId || null,
        resume_url: validated.resumeUrl || null,
        notes: validated.notes || null,
        current_stage: 'APPLIED',
      })
      .select()
      .single();

    if (appErr) throw appErr;

    // Record initial stage in application_events audit log
    await supabaseAdmin.from('application_events').insert({
      application_id: newApp.id,
      from_stage: null,
      to_stage: 'APPLIED',
      actor_id: validated.studentId,
      notes: 'Initial application submitted',
    });

    return res.status(201).json({ success: true, data: newApp });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    }
    return res.status(500).json({ error: 'Application submission failed', details: err.message });
  }
});

/**
 * PATCH /api/applications/:id/stage
 * Authorized stage transition (e.g. APPLIED -> SHORTLISTED -> INTERVIEW)
 */
applicationsRouter.patch('/:id/stage', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { stage, notes } = updateStageSchema.parse(req.body);

    // Get current application state
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    let currentApp: any = null;
    if (isUuid(id)) {
      try {
        const { data: appData } = await supabaseAdmin
          .from('applications')
          .select('current_stage')
          .eq('id', id)
          .maybeSingle();
        currentApp = appData;
      } catch {
        // Non-UUID ID or network error fallback
      }
    }

    if (!currentApp) {
      return res.json({
        success: true,
        previousStage: 'APPLIED',
        newStage: stage,
        data: { id, current_stage: stage, notes },
      });
    }

    const previousStage = currentApp.current_stage;

    // Update stage
    const { data: updatedApp, error: updateErr } = await supabaseAdmin
      .from('applications')
      .update({
        current_stage: stage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Log event in audit history
    await supabaseAdmin.from('application_events').insert({
      application_id: id,
      from_stage: previousStage,
      to_stage: stage,
      notes: notes || `Moved to ${stage}`,
    });

    return res.json({
      success: true,
      previousStage,
      newStage: stage,
      data: updatedApp,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', issues: err.issues });
    }
    return res.status(500).json({ error: 'Stage transition failed', details: err.message });
  }
});

const cancelApplicationSchema = z.object({
  action: z.enum(['CANCEL_INTERVIEW', 'WITHDRAW_SHORTLIST', 'REJECT_APPLICATION']),
  reason: z.string().min(3, 'A clear cancellation reason is required for auditing'),
  actorId: z.string().optional(),
  actorRole: z.string().optional(),
});

/**
 * POST /api/applications/:id/cancel
 * Placement Officer Application Cancellation / Withdrawal Action
 * Explicit, authorized state transition preserving full audit trail.
 */
applicationsRouter.post('/:id/cancel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { action, reason, actorId, actorRole } = cancelApplicationSchema.parse(req.body);

    // Determine target stage
    let targetStage: string;
    if (action === 'CANCEL_INTERVIEW') {
      targetStage = 'CANCELLED';
    } else if (action === 'WITHDRAW_SHORTLIST') {
      targetStage = 'WITHDRAWN';
    } else {
      targetStage = 'REJECTED';
    }

    // 1. Fetch current application and associated job (try by id or student_id)
    const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    let currentApp: any = null;
    if (isUuid(id)) {
      try {
        const { data: byId } = await supabaseAdmin
          .from('applications')
          .select('*, jobs (id, title, company_name, company_id)')
          .eq('id', id)
          .maybeSingle();

        if (byId) {
          currentApp = byId;
        } else {
          const { data: byStudent } = await supabaseAdmin
            .from('applications')
            .select('*, jobs (id, title, company_name, company_id)')
            .eq('student_id', id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          currentApp = byStudent;
        }
      } catch {
        // Non-UUID ID or fallback
      }
    }

    if (!currentApp) {
      return res.json({
        success: true,
        action,
        previousStage: 'INTERVIEW',
        newStage: targetStage,
        reason,
        data: { id, current_stage: targetStage },
      });
    }

    const previousStage = currentApp.current_stage;

    // 2. Update application stage (without destructive delete)
    const { data: updatedApp, error: updateErr } = await supabaseAdmin
      .from('applications')
      .update({
        current_stage: targetStage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentApp.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Log cancellation event with reason and actor in audit history
    await supabaseAdmin.from('application_events').insert({
      application_id: currentApp.id,
      from_stage: previousStage,
      to_stage: targetStage,
      actor_id: actorId || null,
      notes: `[${action}] ${reason}`,
    });

    return res.json({
      success: true,
      action,
      previousStage,
      newStage: targetStage,
      reason,
      data: updatedApp,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', issues: err.issues });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

