/**
 * Section 12: Multi-Core Scaling with Node.js Cluster Module
 * ----------------------------------------------------------
 * By default, Node.js runs in a single thread on a single CPU core.
 * The 'cluster' module allows you to fork multiple worker processes that share
 * the same server port, automatically load-balancing incoming requests across CPU cores.
 */
const cluster = require('cluster');
const http = require('http');
const os = require('os');
const express = require('express');

const PORT = process.env.PORT || 3003;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`\n👑 Primary process ${process.pid} is running.`);
  console.log(`🖥️ Detected ${numCPUs} CPU cores. Forking worker processes for high-availability load balancing...\n`);

  // Fork a worker for each CPU core (limit to 4 for demo purposes if system has many cores)
  const workersToFork = Math.min(numCPUs, 4);
  for (let i = 0; i < workersToFork; i++) {
    cluster.fork();
  }

  // Listen for worker exit (e.g. if a worker crashes, automatically restart it!)
  cluster.on('exit', (worker, code, signal) => {
    console.log(`⚠️ Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Forking a replacement worker...`);
    cluster.fork();
  });

} else {
  // Workers share the TCP connection in this block
  const app = express();

  app.get('/', (req, res) => {
    res.status(200).json({
      message: 'Hello from the load-balanced Cluster Server!',
      workerPid: process.pid,
      note: 'Refresh your browser multiple times to see different Worker PIDs handling your requests!'
    });
  });

  app.get('/heavy-task', (req, res) => {
    // Simulate a brief CPU task
    let total = 0;
    for (let i = 0; i < 5000000; i++) {
      total += i;
    }
    res.status(200).json({
      message: 'Heavy task completed!',
      workerPid: process.pid,
      result: total
    });
  });

  app.listen(PORT, () => {
    console.log(`   └─ 👷 Worker process ${process.pid} started and listening on port ${PORT}`);
  });
}
