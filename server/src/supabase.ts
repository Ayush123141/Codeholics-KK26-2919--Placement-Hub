import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

// Privileged Supabase client using Service Role (BYPASSES RLS)
// STRICTLY FOR TRUSTED SERVER WORKFLOWS
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Anonymous client honoring RLS
export const supabasePublic = createClient(
  config.supabase.url,
  config.supabase.anonKey || config.supabase.serviceRoleKey
);
