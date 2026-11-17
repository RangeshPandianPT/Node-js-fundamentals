/**
 * Section 17: Background Job Worker Handlers
 * -------------------------------------------
 * Defines the concrete worker functions executed by the queue dispatcher.
 * Demonstrates:
 * 1. Progress updates during long-running tasks via job.reportProgress().
 * 2. Injected logging via job.log().
 * 3. Handling transient network/database errors with automatic retries.
 */

const { jobQueue } = require('./queueService');

// Helper to simulate asynchronous I/O delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 1. EMAIL_NOTIFICATION Worker
 * Simulates compiling templates and dispatching transactional emails.
 */
jobQueue.process('EMAIL_NOTIFICATION', async (job) => {
  const { recipient, subject, template = 'welcome' } = job.data;
  job.log(`Preparing email template "${template}" for recipient: ${recipient || 'user@example.com'}`);
  job.reportProgress(20, 'Compiling email template');

  await delay(600);
  job.reportProgress(60, 'Connecting to SMTP gateway');

  await delay(800);
  job.reportProgress(90, 'Transmitting message headers & body');

  await delay(400);
  job.log(`Email successfully delivered to ${recipient}`);

  return {
    delivered: true,
    recipient: recipient || 'user@example.com',
    subject: subject || 'Welcome to Node.js Mastery!',
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  };
});

/**
 * 2. REPORT_GENERATION Worker
 * Simulates heavy data aggregation and multi-step PDF report compilation.
 */
jobQueue.process('REPORT_GENERATION', async (job) => {
  const { reportType = 'Monthly Revenue', format = 'PDF' } = job.data;
  
  job.log(`Starting ${reportType} report compilation in ${format} format...`);
  job.reportProgress(15, 'Scanning database records');
  await delay(800);

  job.reportProgress(40, 'Aggregating financial metrics & charts');
  await delay(900);

  job.reportProgress(70, 'Rendering document pages');
  await delay(1000);

  job.reportProgress(90, 'Compressing and uploading document');
  await delay(600);

  const fileUrl = `https://storage.example.com/reports/${Date.now()}-${reportType.toLowerCase().replace(/\s+/g, '-')}.${format.toLowerCase()}`;
  job.log(`Report compilation complete: ${fileUrl}`);

  return {
    reportType,
    format,
    pages: Math.floor(Math.random() * 20) + 5,
    recordsProcessed: 14250,
    downloadUrl: fileUrl,
    generatedAt: new Date().toISOString()
  };
});

/**
 * 3. IMAGE_OPTIMIZATION Worker
 * Simulates heavy media processing: resizing, compression, thumbnail generation.
 */
jobQueue.process('IMAGE_OPTIMIZATION', async (job) => {
  const { filename = 'banner.png', quality = 85 } = job.data;

  job.log(`Processing media upload: ${filename}`);
  job.reportProgress(25, 'Validating MIME headers & color profile');
  await delay(500);

  job.reportProgress(60, 'Generating multi-resolution thumbnails (128px, 512px, 1024px)');
  await delay(700);

  job.reportProgress(85, 'Executing WebP compression pass');
  await delay(600);

  return {
    originalFilename: filename,
    optimizedFilename: filename.replace(/\.[^/.]+$/, '') + '.webp',
    originalSizeBytes: 4892010,
    optimizedSizeBytes: 1467600,
    compressionRatio: '70% reduction',
    thumbnails: ['thumb_sm.webp', 'thumb_md.webp', 'thumb_lg.webp']
  };
});

/**
 * 4. UNSTABLE_PAYMENT_SYNC Worker
 * Intentionally throws an error on attempts 1 & 2 to showcase automatic retries & backoff.
 * Succeeds cleanly on attempt 3!
 */
jobQueue.process('UNSTABLE_PAYMENT_SYNC', async (job) => {
  const { transactionId = `txn_${Date.now()}` } = job.data;

  job.log(`Attempt ${job.attempts}: Initiating remote banking settlement for ${transactionId}...`);
  await delay(700);

  // Fail on attempt 1 and 2 to demonstrate exponential backoff retries
  if (job.attempts < 3) {
    job.log(`Attempt ${job.attempts}: Upstream Payment Gateway returned 504 Gateway Timeout!`);
    throw new Error(`Upstream Payment Gateway timeout (simulated transient network failure on attempt ${job.attempts})`);
  }

  // Succeeds on attempt 3
  job.reportProgress(100, 'Gateway recovered. Settlement processed successfully!');
  job.log(`Payment settlement completed for transaction ${transactionId}`);

  return {
    status: 'SETTLED',
    transactionId,
    resolvedOnAttempt: job.attempts,
    reconciledAt: new Date().toISOString()
  };
});

/**
 * 5. CUSTOM_TASK Worker
 * Flexible task runner allowing arbitrary duration, progress simulation, or forced failures.
 */
jobQueue.process('CUSTOM_TASK', async (job) => {
  const { title = 'Custom Task', durationMs = 1500, shouldFail = false } = job.data;

  job.log(`Running custom task: "${title}"`);
  const steps = 4;
  const stepTime = Math.max(100, Math.floor(durationMs / steps));

  for (let i = 1; i <= steps; i++) {
    await delay(stepTime);
    job.reportProgress(Math.round((i / steps) * 100), `Step ${i} of ${steps} complete`);
  }

  if (shouldFail) {
    throw new Error(`Task deliberately aborted as requested by user payload.`);
  }

  return {
    title,
    durationMs,
    executedSuccessfully: true
  };
});

module.exports = {
  jobQueue
};
