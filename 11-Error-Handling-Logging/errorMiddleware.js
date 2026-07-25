/**
 * Centralized Global Error Handling Middleware for Express
 * --------------------------------------------------------
 * Intercepts all errors thrown in route handlers or middleware.
 * Formats user-friendly JSON responses and logs stack traces cleanly via Winston.
 */
const logger = require('./logger');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or other unknown error: don't leak error details to client
    logger.error('CRITICAL UNKNOWN ERROR 💥:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on our end! Our engineers have been alerted.'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error using Winston logger
  logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
    statusCode: err.statusCode,
    ip: req.ip,
    stack: err.stack
  });

  if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  } else {
    sendErrorDev(err, res);
  }
};
