# 17. Background Jobs & Message Queue Processing

In production web applications, keeping the Node.js event loop responsive is critical. Long-running tasks—such as sending transactional emails, compressing images, compiling multi-page PDF reports, or calling slow third-party APIs—should **never** block the HTTP request-response cycle.

This module demonstrates **production-grade asynchronous background job processing** using the **Producer-Consumer pattern**, featuring priority scheduling, concurrency throttling, delayed execution, and automatic retries with exponential backoff.

---

## 🏗️ Architecture & Core Concepts

### 1. The Producer-Consumer Pattern

```
 [ HTTP Client ]
        │
        │ 1. POST /api/jobs (e.g., Send Welcome Email)
        ▼
 ┌──────────────┐     2. Enqueue Job
 │ Express API  │ ─────────────────────► ┌──────────────────────────────┐
 │ (Producer)   │                        │        Message Queue         │
 └──────────────┘                        │  [High] ➔ [Normal] ➔ [Low]   │
        │                                └──────────────────────────────┘
        │ 3. 202 Accepted (<5ms)                        │
        ▼                                               │ 4. Dequeue next job
 [ Instant HTTP Response ]                              ▼
                                         ┌──────────────────────────────┐
                                         │   Background Worker Pool     │
                                         │ (Concurrency slots: e.g. 2)  │
                                         └──────────────────────────────┘
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    ▼                                       ▼
                             [ Worker Slot 1 ]                       [ Worker Slot 2 ]
                             • Send Email                            • Compile Report
                             • Report Progress (0-100%)              • Exponential Backoff
```

### 2. Priority-Based Scheduling
Jobs are assigned priority weights:
- **High (`3`)**: Time-sensitive operations (e.g. password resets, security alerts). Processed before all other queued tasks.
- **Normal (`2`)**: Standard operations (e.g. report generation, payment sync).
- **Low (`1`)**: Non-urgent bulk processing (e.g. image optimization, cleanup routines).

### 3. Automatic Retries & Exponential Backoff
When an upstream service (like a database or payment gateway) fails intermittently, jobs are automatically retried with exponential delay:
$$\text{Backoff Delay} = \min(500\text{ms} \times 2^{(\text{attempt} - 1)}, 10000\text{ms})$$
- Attempt 1: Immediate failure
- Attempt 2: Retried after 500ms
- Attempt 3: Retried after 1000ms

### 4. Real-Time Telemetry & Server-Sent Events (SSE)
The server streams live worker updates directly to the web dashboard using native HTTP Server-Sent Events (`/api/queue/events`), providing zero-dependency real-time progress bars, log feeds, and active worker counters.

---

## 🚀 Running the Worker Server

Start the background queue server on port **3007**:

```bash
# from repository root
npm run start:queue
```

Once online, open the interactive control dashboard in your browser:
👉 **[http://localhost:3007](http://localhost:3007)**

---

## 📡 REST API Reference

### 1. Enqueue a Job
```http
POST /api/jobs
Content-Type: application/json

{
  "type": "EMAIL_NOTIFICATION",
  "priority": "high",
  "data": {
    "recipient": "developer@example.com",
    "subject": "System Deployment Completed"
  },
  "delayMs": 0,
  "maxAttempts": 3
}
```

**Response (`202 Accepted`):**
```json
{
  "status": "accepted",
  "message": "Job job_1700000000000_abc123 enqueued successfully.",
  "job": {
    "id": "job_1700000000000_abc123",
    "type": "EMAIL_NOTIFICATION",
    "priority": "high",
    "status": "WAITING",
    "progress": 0,
    "attempts": 0,
    "maxAttempts": 3
  }
}
```

### 2. Check Job Status & Progress
```http
GET /api/jobs/:id
```

### 3. Fire a 5-Task Demonstration Burst
```http
POST /api/jobs/demo-batch
```

### 4. Fetch Real-Time Queue Telemetry
```http
GET /api/queue/stats
```

### 5. Pause / Resume Queue
```http
POST /api/queue/pause
POST /api/queue/resume
```

### 6. Adjust Concurrency Slots
```http
POST /api/queue/concurrency
Content-Type: application/json

{
  "concurrency": 4
}
```

---

## 🧪 Automated Testing

Execute the dedicated background queue test suite:

```bash
npx jest 17-Background-Jobs-Queues/queue.test.js
```

---

## 💡 Real-World Production Tooling
In enterprise microservices, this in-memory architecture maps directly to production message brokers:
- **BullMQ / Bee-Queue**: Redis-backed queues with persistence and horizontal worker scaling.
- **RabbitMQ**: Advanced AMQP message routing, exchange bindings, and dead-letter exchanges.
- **AWS SQS / Google Cloud Tasks**: Fully-managed serverless task queues.
