/**
 * Supabase Client Module
 *
 * Typed Supabase client initialization using Vite environment variables.
 * Exports client for use in service modules.
 *
 * Environment variables (set in .env):
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous key
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with Vite's pattern
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL') {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
      'Create a .env file with VITE_SUPABASE_URL=https://your-project.supabase.co'
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
      'Create a .env file with VITE_SUPABASE_ANON_KEY=your-anon-key'
  );
}

/**
 * Typed Supabase client instance.
 * Use this for all database and auth operations.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
