const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation helper for placeholders and missing values
const isPlaceholder = (val) => {
  return (
    !val ||
    val.includes('your-') ||
    val.includes('placeholder') ||
    val.includes('<') ||
    val.includes('xyzcompany')
  );
};

if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    '[Supabase Warning] SUPABASE_URL or SUPABASE_ANON_KEY is not configured with valid credentials in .env.'
  );
  console.warn(
    '\x1b[33m%s\x1b[0m',
    '[Supabase Warning] Update backend/.env with your Supabase project credentials.'
  );
}

/**
 * Public/Anon client - for operations scoped by RLS or user JWT tokens
 */
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
    },
  }
);

/**
 * Service Role Admin client - strictly for backend administrative tasks.
 * NEVER expose this client or SUPABASE_SERVICE_ROLE_KEY to the frontend.
 */
const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Returns a Supabase client scoped to an authenticated user's access token,
 * allowing PostgreSQL Row Level Security (RLS) policies to evaluate auth.uid().
 *
 * @param {string} accessToken - User JWT access token
 */
const getAuthenticatedClient = (accessToken) => {
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
      },
    }
  );
};

/**
 * Test connectivity to Supabase project
 */
const checkSupabaseConnection = async () => {
  if (isPlaceholder(supabaseUrl) || isPlaceholder(supabaseAnonKey)) {
    return {
      connected: false,
      status: 'unconfigured',
      message: 'Supabase credentials contain placeholders or are unset in .env',
    };
  }

  try {
    // Perform a lightweight probe to the auth health or schema
    const { error } = await supabase.from('organizations').select('id').limit(1);

    // If table doesn't exist yet, it's still connected to Supabase (PGRST204 or PGRST205 or code 42P01)
    if (error && error.code !== '42P01' && error.code !== 'PGRST204' && error.code !== 'PGRST205') {
      return {
        connected: false,
        status: 'error',
        message: error.message,
      };
    }

    return {
      connected: true,
      status: 'connected',
      message: 'Supabase PostgreSQL connection reachable',
      projectUrl: supabaseUrl,
    };
  } catch (err) {
    return {
      connected: false,
      status: 'error',
      message: err.message,
    };
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  getAuthenticatedClient,
  checkSupabaseConnection,
};
