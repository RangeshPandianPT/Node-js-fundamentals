/**
 * Section 11: Production Error Handling & Logging Demo Server
 * -----------------------------------------------------------
 * Demonstrates best practices for:
 * 1. Handling operational API errors vs programming bugs.
 * 2. Catching unhandled rejections (Promises) and uncaught exceptions.
 * 3. Structured logging with Winston.
 * 4. Graceful server shutdown on SIGINT / SIGTERM signals.
 */

// 1. Handle Uncaught Exceptions (synchronous crashes outside Express) BEFORE anything else
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down immediately...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

const express = require('express');
const logger = require('./logger');
const AppError = require('./AppError');
const globalErrorHandler = require('./errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`Incoming request: [${req.method}] ${req.originalUrl}`);
  next();
});

// Route 1: Successful health check
app.get('/api/health', (req, res) => {
  logger.info('Health check endpoint called successfully.');
  res.status(200).json({ status: 'success', message: 'Server is healthy and logging properly!' });
});

// Route 2: Simulate an operational error (e.g. user requested non-existent ID)
app.get('/api/users/:id', (req, res, next) => {
  const userId = req.params.id;
  if (isNaN(userId)) {
    // We pass our AppError to next(), which routes straight to our global errorHandler
    return next(new AppError('User ID must be a valid number!', 400));
  }
  if (userId > 100) {
    return next(new AppError(`User with ID ${userId} not found in database.`, 404));
  }
  res.status(200).json({ status: 'success', data: { id: userId, name: 'Jane Doe' } });
});

// Route 3: Simulate a programming/system crash (non-operational error)
app.get('/api/simulate-crash', (req, res, next) => {
  // Attempting to call an undefined function will throw a TypeError (not an AppError)
  try {
    const nonExistentObj = undefined;
    console.log(nonExistentObj.someProperty);
  } catch (err) {
    next(err); // Passed to errorHandler, treated as 500 Server Error
  }
});

// Handle 404 for undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Register Global Error Handling Middleware
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  logger.info(`🚀 Error Handling & Logging Demo Server running on http://localhost:${PORT}`);
  logger.info(`👉 Try testing: http://localhost:${PORT}/api/users/invalid-id or /api/simulate-crash`);
});

// 2. Handle Unhandled Rejections (asynchronous Promise rejections outside Express)
process.on('unhandledRejection', (err) => {
  logger.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
  logger.error(err.name, err.message);
  // Close server first to finish pending requests, then exit process
  server.close(() => {
    process.exit(1);
  });
});

// 3. Graceful Shutdown on SIGTERM / SIGINT (e.g. Docker container stop or Ctrl+C)
const gracefulShutdown = (signal) => {
  logger.info(`👋 Received ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    logger.info('✅ HTTP server closed. All connections terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
