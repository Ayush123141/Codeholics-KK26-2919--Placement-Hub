import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: 'STUDENT' | 'PLACEMENT_OFFICER';
  };
}

/**
 * Middleware: Verify Supabase JWT token from Authorization header
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // Handle verified demo sessions
  if (token.startsWith('demo_')) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace('demo_', ''), 'base64').toString('utf-8'));
      if (decoded.exp && Date.now() > decoded.exp) {
        return res.status(401).json({ error: 'Session expired' });
      }
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      return next();
    } catch {
      return res.status(401).json({ error: 'Malformed authorization token' });
    }
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Fetch user profile role from public.profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'STUDENT',
    };

    next();
  } catch (err: any) {
    return res.status(500).json({ error: 'Authentication verification failed', details: err.message });
  }
}

/**
 * Middleware: Enforce Role Access Control
 */
export function requireRoles(roles: Array<'STUDENT' | 'PLACEMENT_OFFICER'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of: ${roles.join(', ')}`,
      });
    }

    next();
  };
}
