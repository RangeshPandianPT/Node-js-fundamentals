/**
 * Section 12: Worker Threads Offloading Demo
 * ------------------------------------------
 * Demonstrates the dramatic difference between running CPU-bound tasks
 * synchronously on the main thread (which freezes the server for everyone)
 * versus offloading them to a background worker thread using 'worker_threads'.
 */
const express = require('express');
const { Worker } = require('worker_threads');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3004;

// 1. Fast, responsive endpoint to test server health and responsiveness
app.get('/api/ping', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🏓 Pong! Server is responsive and Event Loop is free.',
    timestamp: new Date().toLocaleTimeString()
  });
});

// 2. BLOCKING ENDPOINT: Runs heavy calculation directly on the Main Thread
// WARNING: Calling this will freeze the server for several seconds! During this time, /api/ping will hang.
app.get('/api/blocking', (req, res) => {
  const limit = 4000000; // 4 million prime checks
  console.log(`[Main Thread] Starting BLOCKING calculation (limit: ${limit}). Server will freeze...`);
  
  const startTime = Date.now();
  let count = 0;
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
  }
  const durationMs = Date.now() - startTime;

  console.log(`[Main Thread] BLOCKING calculation finished in ${durationMs}ms.`);
  res.status(200).json({
    status: 'success',
    mode: 'BLOCKING (Main Thread)',
    primeCount: count,
    durationMs,
    warning: 'Notice how calling /api/ping while this ran caused it to hang!'
  });
});

// 3. NON-BLOCKING ENDPOINT: Offloads calculation to background Worker Thread
// Calling this keeps the main Event Loop completely free, so /api/ping responds instantly!
app.get('/api/non-blocking', (req, res) => {
  const limit = 4000000;
  console.log(`[Main Thread] Spawning background Worker Thread for calculation (limit: ${limit})...`);

  const worker = new Worker(path.join(__dirname, 'worker.js'), {
    workerData: { limit }
  });

  worker.on('message', (result) => {
    console.log(`[Worker Thread ${result.threadId}] Calculation finished in ${result.durationMs}ms.`);
    res.status(200).json({
      status: 'success',
      mode: 'NON-BLOCKING (Worker Thread)',
      ...result,
      note: 'Notice how calling /api/ping while this ran responded immediately without lagging!'
    });
  });

  worker.on('error', (err) => {
    console.error('[Worker Thread Error]:', err);
    res.status(500).json({ status: 'error', message: err.message });
  });

  worker.on('exit', (code) => {
    if (code !== 0) {
      console.error(`Worker stopped with exit code ${code}`);
    }
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Worker Threads Demo Server running on http://localhost:${PORT}`);
    console.log(`👉 Step 1: Open terminal/browser and test fast response: http://localhost:${PORT}/api/ping`);
    console.log(`👉 Step 2: Call the BLOCKING route: http://localhost:${PORT}/api/blocking (try pinging while it runs - it lags!)`);
    console.log(`👉 Step 3: Call the NON-BLOCKING route: http://localhost:${PORT}/api/non-blocking (pinging while it runs is instant!)`);
  });
}

module.exports = app;
