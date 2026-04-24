/**
 * Centralized Error Handling Middleware
 * Catches all errors passed via next(err) and formats consistent JSON responses.
 */

// ── 404 Not Found ─────────────────────────────────────────────────────────────
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// ── Global Error Handler ──────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  // Log all errors server-side
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${new Date().toISOString()}] ❌ ${err.status || 500} ${req.method} ${req.originalUrl}`);
    if (err.status !== 404) console.error(err.stack);
  }

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(statusCode).json({ success: false, message, errors });
  }

  // Mongoose Duplicate Key (unique constraint)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
    return res.status(statusCode).json({ success: false, message });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    return res.status(statusCode).json({ success: false, message });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
    return res.status(statusCode).json({ success: false, message });
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
    return res.status(statusCode).json({ success: false, message });
  }

  // Default response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};

module.exports = { notFound, errorHandler };
