import { createClient } from '@supabase/supabase-js';

// Prefer Vite environment variables (Netlify will inject these at build time)
const env = (import.meta as any).env ?? {};
const supabaseUrl: string | undefined = env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey: string | undefined = env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set. Falling back to hardcoded values. ' +
      'Set these in your Netlify Environment variables.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://sjqqjfvcxgnzvodyrpyi.supabase.co',
  supabaseAnonKey ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcXFqZnZjeGduenZvZHlycHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNDk2NjcsImV4cCI6MjA5NTgyNTY2N30.KQVsRI-Opmp7WFxzgRsgknDbPWIlj_Lhp6BsiMzFqNo',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
