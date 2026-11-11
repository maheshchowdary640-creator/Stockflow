const { supabase, getAuthenticatedClient } = require('../config/supabase');

/**
 * Supabase JWT Authentication Middleware
 *
 * Verifies Supabase Auth Bearer token from the Authorization header.
 * Attaches the authenticated user and user-scoped Supabase client to `req`.
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Authorization denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired authentication token.',
      });
    }

    // Attach authenticated user information
    req.user = user;
    // Provide a Supabase client configured with the user's Bearer token so RLS policies are enforced
    req.supabase = getAuthenticatedClient(token);

    next();
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Authentication processing failure',
    });
  }
};

module.exports = {
  requireAuth,
};
