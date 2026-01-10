// Supabase client configuration
//
// SETUP OPTIONS:
//
// Option A: For local development, create a config.local.js file (gitignored):
//   window.SUPABASE_URL = 'https://your-project.supabase.co';
//   window.SUPABASE_ANON_KEY = 'your-anon-key';
//   Then include it in index.html BEFORE this script.
//
// Option B: For Vercel deployment, set environment variables in Vercel dashboard
//   and use a build step to inject them (requires build tool).
//
// Option C: Set the values directly here for simple deployments.
//   NOTE: The anon key is safe to expose - RLS policies protect your data.
//
// Get these from: Supabase Dashboard > Project Settings > API

const SUPABASE_URL = window.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Validate configuration
if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('Supabase not configured! See js/supabase.js for setup instructions.');
}

// Initialize the Supabase client
// Note: We use a different variable name to avoid conflicts with window.supabase (the CDN library)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export for use in other modules
window.supabaseClient = supabaseClient;
