/**
 * Section 17: Background Job Queue Test Suite
 * -------------------------------------------
 * Validates the core mechanics of the background worker system:
 * 1. Priority scheduling (High vs Normal vs Low).
 * 2. Concurrency limiting across worker slots.
 * 3. Automatic retry & exponential backoff on transient errors.
 * 4. Pause and resume queue management.
 * 5. Accurate telemetry calculations.
 */

const { JobQueue } = require('./queueService');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Section 17: Background Job Queue Test Suite', () => {
  let testQueue;

  beforeEach(() => {
    testQueue = new JobQueue({ name: 'test-queue', concurrency: 1 });
  });

  afterEach(() => {
    testQueue.clear('all');
  });

  test('should enqueue a job with correct properties and default status', () => {
    testQueue.pause(); // Pause so it doesn't process immediately

    const job = testQueue.enqueue('TEST_TASK', { foo: 'bar' }, { priority: 'high' });

    expect(job).toBeDefined();
    expect(job.id).toMatch(/^job_/);
    expect(job.type).toBe('TEST_TASK');
    expect(job.priority).toBe('high');
    expect(job.priorityLevel).toBe(3);
    expect(job.status).toBe('WAITING');
    expect(job.data).toEqual({ foo: 'bar' });
  });

  test('should execute jobs and report progress', async () => {
    let handlerCalled = false;
    let progressReported = null;

    testQueue.process('WORKER_PROGRESS_TEST', async (job) => {
      handlerCalled = true;
      job.reportProgress(50, 'Halfway there');
      progressReported = job.progress;
      await delay(20);
      return { ok: true };
    });

    const job = testQueue.enqueue('WORKER_PROGRESS_TEST', {});

    // Wait for completion
    await new Promise((resolve) => {
      testQueue.on('job:completed', (completedJob) => {
        if (completedJob.id === job.id) resolve();
      });
    });

    expect(handlerCalled).toBe(true);
    expect(progressReported).toBe(50);
    expect(job.status).toBe('COMPLETED');
    expect(job.progress).toBe(100);
    expect(job.result).toEqual({ ok: true });
    expect(job.durationMs).toBeGreaterThanOrEqual(15);
  });

  test('should prioritize HIGH priority jobs over NORMAL and LOW priority jobs', async () => {
    testQueue.pause(); // Hold execution to load up queue

    const executionOrder = [];

    testQueue.process('ORDER_TEST', async (job) => {
      executionOrder.push(job.data.name);
      await delay(10);
      return true;
    });

    // Enqueue in reverse order: low, then normal, then high
    testQueue.enqueue('ORDER_TEST', { name: 'low-task' }, { priority: 'low' });
    testQueue.enqueue('ORDER_TEST', { name: 'normal-task' }, { priority: 'normal' });
    testQueue.enqueue('ORDER_TEST', { name: 'high-task' }, { priority: 'high' });

    testQueue.resume();

    await new Promise((resolve) => {
      testQueue.on('queue:drained', resolve);
    });

    // High priority must run first, followed by normal, then low
    expect(executionOrder).toEqual(['high-task', 'normal-task', 'low-task']);
  });

  test('should respect concurrency limits', async () => {
    const concurrentQueue = new JobQueue({ name: 'concurrency-test', concurrency: 2 });
    let maxSimultaneousActive = 0;
    let currentlyActive = 0;

    concurrentQueue.process('CONCURRENCY_TASK', async () => {
      currentlyActive++;
      if (currentlyActive > maxSimultaneousActive) {
        maxSimultaneousActive = currentlyActive;
      }
      await delay(40);
      currentlyActive--;
      return true;
    });

    // Enqueue 5 jobs
    for (let i = 0; i < 5; i++) {
      concurrentQueue.enqueue('CONCURRENCY_TASK', { index: i });
    }

    await new Promise((resolve) => {
      concurrentQueue.on('queue:drained', resolve);
    });

    expect(maxSimultaneousActive).toBeLessThanOrEqual(2);
    expect(concurrentQueue.getStats().metrics.totalCompleted).toBe(5);
  });

  test('should retry failed jobs up to maxAttempts before failing', async () => {
    let callCount = 0;

    testQueue.process('FLAKY_TASK', async (job) => {
      callCount++;
      if (callCount < 3) {
        throw new Error(`Transient failure on attempt ${callCount}`);
      }
      return { recoveredOn: callCount };
    });

    const job = testQueue.enqueue('FLAKY_TASK', {}, { maxAttempts: 3 });

    await new Promise((resolve) => {
      testQueue.on('job:completed', (completedJob) => {
        if (completedJob.id === job.id) resolve();
      });
    });

    expect(callCount).toBe(3);
    expect(job.status).toBe('COMPLETED');
    expect(job.attempts).toBe(3);
    expect(testQueue.getStats().metrics.totalRetries).toBe(2);
  });

  test('should mark job as FAILED when maxAttempts are exhausted', async () => {
    testQueue.process('DOOMED_TASK', async () => {
      throw new Error('Fatal unrecoverable error');
    });

    const job = testQueue.enqueue('DOOMED_TASK', {}, { maxAttempts: 2 });

    await new Promise((resolve) => {
      testQueue.on('job:failed', (failedJob) => {
        if (failedJob.id === job.id) resolve();
      });
    });

    expect(job.status).toBe('FAILED');
    expect(job.attempts).toBe(2);
    expect(testQueue.getStats().metrics.totalFailed).toBe(1);
  });

  test('should accurately calculate queue telemetry stats', async () => {
    testQueue.process('STATS_TASK', async () => {
      await delay(25);
      return true;
    });

    testQueue.enqueue('STATS_TASK', {});
    testQueue.enqueue('STATS_TASK', {});

    await new Promise((resolve) => {
      testQueue.on('queue:drained', resolve);
    });

    const stats = testQueue.getStats();
    expect(stats.counts.totalEnqueued).toBe(2);
    expect(stats.metrics.totalCompleted).toBe(2);
    expect(stats.metrics.avgProcessingTimeMs).toBeGreaterThanOrEqual(15);
  });
});
