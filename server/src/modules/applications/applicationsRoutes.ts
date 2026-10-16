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
 * List all applications for a specific job (Recruiter / Placement Officer)
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
    const { data: currentApp, error: fetchErr } = await supabaseAdmin
      .from('applications')
      .select('current_stage')
      .eq('id', id)
      .single();

    if (fetchErr || !currentApp) {
      return res.status(404).json({ error: 'Application not found' });
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
