const { checkSupabaseConnection } = require('../config/supabase');

/**
 * Controller to handle API health check requests.
 * Returns system status, environment, uptime, and Supabase connection state.
 *
 * @route   GET /api/health
 * @access  Public
 */
const getHealthStatus = async (req, res) => {
  const dbHealth = await checkSupabaseConnection();

  return res.status(200).json({
    status: 'success',
    message: 'StockFlow Backend API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} seconds`,
    environment: process.env.NODE_ENV || 'development',
    database: {
      engine: 'Supabase PostgreSQL',
      status: dbHealth.status,
      connected: dbHealth.connected,
      message: dbHealth.message,
    },
  });
};

module.exports = {
  getHealthStatus,
};
