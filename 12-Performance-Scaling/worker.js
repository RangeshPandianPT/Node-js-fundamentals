/**
 * Worker Thread Script for Heavy Computation
 * ------------------------------------------
 * Runs in a separate V8 isolate thread without blocking the main Node.js Event Loop.
 * Communication with the main thread happens via parentPort messages and workerData.
 */
const { parentPort, workerData } = require('worker_threads');

// Simulate a very CPU-intensive computation (counting primes up to a large number)
function countPrimes(max) {
  let count = 0;
  for (let i = 2; i <= max; i++) {
    let isPrime = true;
    for (let j = 2; j <= Math.sqrt(i); j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
  }
  return count;
}

const limit = workerData.limit || 5000000;
const startTime = Date.now();
const primeCount = countPrimes(limit);
const durationMs = Date.now() - startTime;

// Send the computed result back to the main thread
parentPort.postMessage({
  status: 'success',
  primeCount,
  durationMs,
  threadId: require('worker_threads').threadId
});
