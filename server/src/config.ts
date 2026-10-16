import dotenv from 'dotenv';
import path from 'path';

// Load .env from root project directory or local
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  },
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

if (!config.supabase.url) {
  console.warn('⚠️ Warning: SUPABASE_URL is not set in environment variables');
}
