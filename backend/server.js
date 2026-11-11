const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { checkSupabaseConnection } = require('./config/supabase');
const healthRoutes = require('./routes/healthRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// 1. Load Environment Variables
dotenv.config();

// 2. Initialize Express Application
const app = express();

// 3. Verify Database Connectivity (Supabase PostgreSQL)
checkSupabaseConnection().then((result) => {
  if (result.connected) {
    console.log(`[Database] Supabase PostgreSQL reachable at: ${result.projectUrl}`);
  } else {
    console.warn(`[Database Warning] ${result.message}`);
  }
});

// 4. Configure Cross-Origin Resource Sharing (CORS)
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 5. Request Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 6. Mount Application Routes
app.use('/api/health', healthRoutes);

// Root route for quick verification
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'StockFlow Backend API',
    version: '1.0.0',
    database: 'Supabase PostgreSQL',
    documentation: '/api/health for system status',
  });
});

// 7. Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

// 8. Start HTTP Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] StockFlow Backend running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Server Error] Unhandled Rejection: ${err.message}`);
});

module.exports = app;
