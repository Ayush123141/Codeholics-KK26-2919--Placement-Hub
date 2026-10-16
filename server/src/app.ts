import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { skillsRouter } from './modules/skills/skillsRouter';
import { assessmentsRouter } from './modules/assessments/assessmentsRouter';
import { githubRouter } from './modules/github/githubRouter';
import { certificatesRouter } from './modules/certificates/certificatesRouter';
import { evidenceRouter } from './modules/evidence/evidenceRouter';
import { matchingRouter } from './modules/matching/matchingRouter';
import { resumesRouter } from './modules/resumes/resumesRouter';
import { seedDemoEvidence } from './utils/demoSeed';

import { authRouter } from './modules/auth/authRouter';
import { jobsRouter } from './modules/jobs/jobsRoutes';
import { applicationsRouter } from './modules/applications/applicationsRoutes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize demo fixtures
seedDemoEvidence();

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'ProofHire Placement Hub API',
    version: '1.0.0',
    modules: [
      'skills',
      'assessments',
      'github',
      'certificates',
      'evidence',
      'matching',
      'resumes',
      'jobs',
      'applications',
      'supabase',
    ],
    member3Modules: [
      'skills',
      'assessments',
      'github',
      'certificates',
      'evidence',
      'matching',
      'resumes',
    ],
  });
});

// Member 3 Module Routers
app.use('/api/skills', skillsRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/github', githubRouter);
app.use('/api/certificates', certificatesRouter);
app.use('/api/evidence', evidenceRouter);
app.use('/api/matching', matchingRouter);
app.use('/api/resumes', resumesRouter);

// Member 2 Module Routers
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);

export default app;
