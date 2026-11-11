/**
 * StockFlow Centralized Error Handling Middleware & 404 Handler
 *
 * Designed for Supabase PostgreSQL & Express.
 * Handles HTTP errors, PostgreSQL error codes (23505, 23503, 23514),
 * and Supabase Auth errors.
 */

/**
 * 404 Not Found Middleware
 * Intercepts requests that do not match any defined application routes.
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource not found: ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';
  let details = null;

  // 1. PostgreSQL Error Codes (returned by Supabase PostgREST)
  if (err.code) {
    switch (err.code) {
      // 23505: Unique violation (e.g. duplicate organization SKU)
      case '23505':
        statusCode = 409;
        message = 'A record with these unique details already exists.';
        if (err.details && err.details.includes('uq_organization_sku')) {
          message = 'A product with this SKU already exists in this organization.';
        }
        break;

      // 23503: Foreign key violation
      case '23503':
        statusCode = 400;
        message = 'Referenced entity does not exist.';
        break;

      // 23514: Check constraint violation (e.g. negative quantity or price)
      case '23514':
        statusCode = 400;
        message = 'Validation constraint violated. Quantity and prices cannot be negative.';
        break;

      // 42P01: Undefined table
      case '42P01':
        statusCode = 500;
        message = 'Database schema table is missing. Run database migration script.';
        break;

      // PGRST116: Resource not found or single row expected
      case 'PGRST116':
        statusCode = 404;
        message = 'Requested resource was not found.';
        break;

      default:
        break;
    }
  }

  // 2. Supabase Auth Errors
  if (err.name === 'AuthApiError' || err.__isAuthError) {
    statusCode = err.status || 401;
    message = err.message || 'Authentication error';
  }

  // 3. Fallback 500 in Production
  if (statusCode === 500 && !isDev) {
    message = 'An internal server error occurred';
  }

  const responsePayload = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    ...(isDev && err.details && { details: err.details }),
    ...(isDev && err.hint && { hint: err.hint }),
    ...(isDev && { stack: err.stack }),
  };

  return res.status(statusCode).json(responsePayload);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
