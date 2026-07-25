/**
 * Custom Operational Error Class
 * ------------------------------
 * Extends the native Node.js Error class to include HTTP status codes and an
 * 'isOperational' flag. Operational errors represent predictable failures
 * (e.g. invalid user input, item not found) rather than programming bugs.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag to differentiate from programmer/system bugs

    // Capture stack trace without polluting it with the constructor call itself
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
