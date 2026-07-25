/**
 * Enterprise-Grade Winston Logger Configuration
 * ---------------------------------------------
 * Replaces console.log with structured logging with timestamps, log levels,
 * colored terminal output for development, and persistent file storage for production.
 */
const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure log directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom log format
const customFormat = format.printf(({ level, message, timestamp, stack, ...meta }) => {
  let logMsg = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  if (Object.keys(meta).length) {
    logMsg += ` | Meta: ${JSON.stringify(meta)}`;
  }
  return logMsg;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }), // Include stack trace in error logs
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'node-fundamentals-api' },
  transports: [
    // Write all errors (and below) to error.log
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB max file size before rotation
      maxFiles: 5
    }),
    // Write all logs of importance info or higher to combined.log
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// If we are not in production, log to console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'HH:mm:ss' }),
        customFormat
      )
    })
  );
}

module.exports = logger;
