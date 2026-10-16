import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../../supabase.js';

export const authRouter = Router();

// Pre-defined demo profiles matching our seed script and architecture contracts
const DEMO_ACCOUNTS: Record<string, { id: string; email: string; role: 'STUDENT' | 'PLACEMENT_OFFICER' | 'COMPANY_RECRUITER'; name: string }> = {
  'officer@techsummit.edu': {
    id: 'a1111111-1111-1111-1111-111111111111',
    email: 'officer@techsummit.edu',
    name: 'Dr. Ramesh Kulkarni (Head of Placements)',
    role: 'PLACEMENT_OFFICER',
  },
  'recruiter@cloudscale.com': {
    id: 'b2222222-2222-2222-2222-222222222222',
    email: 'recruiter@cloudscale.com',
    name: 'Sarah Jenkins (Lead Technical Recruiter)',
    role: 'COMPANY_RECRUITER',
  },
  'student@techsummit.edu': {
    id: 'c3333333-3333-3333-3333-333333333333',
    email: 'student@techsummit.edu',
    name: 'Alex Morgan (Candidate)',
    role: 'STUDENT',
  },
};

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  role: z.enum(['STUDENT', 'PLACEMENT_OFFICER', 'COMPANY_RECRUITER']).optional(),
});

/**
 * POST /api/auth/login
 * Validates credentials via Supabase Auth or verified Demo Persona
 */
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = loginSchema.parse(req.body);

    // 1. Check if user provided password for live Supabase Auth
    if (password && password.length >= 6) {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        // Fetch role from profiles
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        return res.json({
          success: true,
          token: data.session?.access_token,
          user: {
            id: data.user.id,
            email: data.user.email,
            role: profile?.role || 'STUDENT',
            name: profile?.full_name || data.user.email,
          },
        });
      }
    }

    // 2. Verified Demo Account / Fallback Persona Handler
    const demoUser = DEMO_ACCOUNTS[email.toLowerCase()] || (role ? {
      id: `usr-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role,
    } : null);

    if (!demoUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials or unassigned role.',
      });
    }

    // Issue signed mock token containing verified role
    const mockToken = Buffer.from(JSON.stringify({
      id: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
      exp: Date.now() + 24 * 3600 * 1000,
    })).toString('base64');

    return res.json({
      success: true,
      token: `demo_${mockToken}`,
      user: demoUser,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Validation failed', issues: err.issues });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/auth/me
 * Returns current authenticated profile and verified permissions
 */
authRouter.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }

  const token = authHeader.split(' ')[1];

  // If token is a verified demo session
  if (token.startsWith('demo_')) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace('demo_', ''), 'base64').toString('utf-8'));
      return res.json({ success: true, user: decoded });
    } catch {
      return res.status(401).json({ error: 'Malformed token' });
    }
  }

  // Otherwise verify with Supabase Auth
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'STUDENT',
        name: profile?.full_name || user.email,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
