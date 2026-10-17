import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('your-project') &&
  !supabasePublishableKey.includes('your-supabase') &&
  !supabasePublishableKey.includes('your_supabase')
);

let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabasePublishableKey);
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
  }

  if (supabaseServiceRoleKey) {
    try {
      supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (error) {
      console.warn('Failed to initialize Supabase Admin client:', error);
    }
  }
}

export const supabase = supabaseInstance;
export const supabaseAdmin = supabaseAdminInstance || supabaseInstance;

