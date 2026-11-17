/**
 * Section 17: Background Job Queues & Worker Processing Server
 * -------------------------------------------------------------
 * Demonstrates:
 * 1. Asynchronous non-blocking job queuing using the Producer-Consumer pattern.
 * 2. Express REST API for job dispatching, status retrieval, and queue management.
 * 3. Server-Sent Events (SSE) for zero-latency live telemetry broadcasting to the UI.
 * 4. Priority-based execution, delayed scheduling, and automatic exponential backoff retries.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const { jobQueue } = require('./queueService');
require('./jobWorker'); // Register worker task handlers

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set of connected Server-Sent Event (SSE) clients
const sseClients = new Set();

/**
 * Broadcast an event to all connected UI clients via SSE
 */
function broadcastSse(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

// Hook queue events to live SSE broadcast
jobQueue.on('job:enqueued', (job) => broadcastSse('job_update', { event: 'enqueued', job, stats: jobQueue.getStats() }));
jobQueue.on('job:started', (job) => broadcastSse('job_update', { event: 'started', job, stats: jobQueue.getStats() }));
jobQueue.on('job:progress', (data) => broadcastSse('job_progress', { ...data, stats: jobQueue.getStats() }));
jobQueue.on('job:completed', (job) => broadcastSse('job_update', { event: 'completed', job, stats: jobQueue.getStats() }));
jobQueue.on('job:failed', (job) => broadcastSse('job_update', { event: 'failed', job, stats: jobQueue.getStats() }));
jobQueue.on('job:retrying', (data) => broadcastSse('job_update', { event: 'retrying', ...data, stats: jobQueue.getStats() }));
jobQueue.on('queue:paused', () => broadcastSse('queue_state', { isPaused: true, stats: jobQueue.getStats() }));
jobQueue.on('queue:resumed', () => broadcastSse('queue_state', { isPaused: false, stats: jobQueue.getStats() }));
jobQueue.on('queue:concurrency_changed', (c) => broadcastSse('queue_state', { concurrency: c, stats: jobQueue.getStats() }));

// ==========================================
// 1. Job Dispatch & Management Endpoints
// ==========================================

/**
 * POST /api/jobs
 * Enqueue a new background task
 */
app.post('/api/jobs', (req, res) => {
  const { type, data, priority, delayMs, maxAttempts } = req.body;

  if (!type) {
    return res.status(400).json({ status: 'error', message: 'Job "type" is required.' });
  }

  try {
    const job = jobQueue.enqueue(type, data || {}, {
      priority: priority || 'normal',
      delayMs: delayMs || 0,
      maxAttempts: maxAttempts || 3
    });

    res.status(202).json({
      status: 'accepted',
      message: `Job ${job.id} enqueued successfully.`,
      job
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/jobs
 * List recent jobs with optional status filter
 */
app.get('/api/jobs', (req, res) => {
  const { status, limit } = req.query;
  const jobs = jobQueue.getJobs({
    status,
    limit: limit ? parseInt(limit, 10) : 50
  });

  res.json({
    status: 'success',
    count: jobs.length,
    jobs
  });
});

/**
 * GET /api/jobs/:id
 * Retrieve full details and execution logs for a specific job
 */
app.get('/api/jobs/:id', (req, res) => {
  const job = jobQueue.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ status: 'error', message: `Job "${req.params.id}" not found.` });
  }

  res.json({
    status: 'success',
    job
  });
});

/**
 * POST /api/jobs/demo-batch
 * Enqueues a realistic batch of mixed-priority tasks to demonstrate scheduling
 */
app.post('/api/jobs/demo-batch', (req, res) => {
  const batch = [
    {
      type: 'EMAIL_NOTIFICATION',
      priority: 'high',
      data: { recipient: 'executive@startup.io', subject: 'Urgent: Security Alert' }
    },
    {
      type: 'REPORT_GENERATION',
      priority: 'normal',
      data: { reportType: 'Q4 Financial Statement', format: 'PDF' }
    },
    {
      type: 'IMAGE_OPTIMIZATION',
      priority: 'low',
      data: { filename: 'hero-banner-large.png', quality: 80 }
    },
    {
      type: 'UNSTABLE_PAYMENT_SYNC',
      priority: 'normal',
      data: { transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}` }
    },
    {
      type: 'EMAIL_NOTIFICATION',
      priority: 'high',
      data: { recipient: 'founder@scaleup.tech', subject: 'Product Launch Update' }
    }
  ];

  const createdJobs = batch.map(item => jobQueue.enqueue(item.type, item.data, { priority: item.priority }));

  res.status(202).json({
    status: 'accepted',
    message: `Batch of ${createdJobs.length} demonstration jobs enqueued.`,
    count: createdJobs.length,
    jobs: createdJobs
  });
});

// ==========================================
// 2. Queue Telemetry & Control Endpoints
// ==========================================

/**
 * GET /api/queue/stats
 * Real-time queue metrics and worker statuses
 */
app.get('/api/queue/stats', (req, res) => {
  res.json({
    status: 'success',
    stats: jobQueue.getStats()
  });
});

/**
 * POST /api/queue/pause
 * Pause queue processing
 */
app.post('/api/queue/pause', (req, res) => {
  jobQueue.pause();
  res.json({ status: 'success', message: 'Queue processing paused.', isPaused: true });
});

/**
 * POST /api/queue/resume
 * Resume queue processing
 */
app.post('/api/queue/resume', (req, res) => {
  jobQueue.resume();
  res.json({ status: 'success', message: 'Queue processing resumed.', isPaused: false });
});

/**
 * POST /api/queue/concurrency
 * Adjust active concurrent worker slots
 */
app.post('/api/queue/concurrency', (req, res) => {
  const { concurrency } = req.body;
  try {
    jobQueue.setConcurrency(concurrency);
    res.json({
      status: 'success',
      message: `Worker concurrency updated to ${jobQueue.concurrency}.`,
      concurrency: jobQueue.concurrency
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
});

/**
 * DELETE /api/queue/clear
 * Clear jobs from memory
 */
app.delete('/api/queue/clear', (req, res) => {
  const { type = 'all' } = req.query;
  jobQueue.clear(type);
  res.json({ status: 'success', message: `Queue "${type}" jobs cleared.` });
});

/**
 * GET /api/queue/events
 * Server-Sent Events (SSE) live stream for dashboard real-time updates
 */
app.get('/api/queue/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial state snapshot immediately upon connection
  res.write(`event: init\ndata: ${JSON.stringify({ stats: jobQueue.getStats(), jobs: jobQueue.getJobs({ limit: 30 }) })}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Start Express Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Section 17: Background Job Queue Server is Online!`);
    console.log(`📡 Server Address: http://localhost:${PORT}`);
    console.log(`🖥️  Live Dashboard: http://localhost:${PORT}`);
    console.log(`⚙️  Active Workers: ${jobQueue.concurrency} concurrent slots`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
