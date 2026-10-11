# 16. Caching Strategies & Redis Integration

Caching is one of the most effective techniques for reducing database bottlenecks, cutting server response latency from hundreds of milliseconds down to single digits, and increasing overall request throughput.

This module demonstrates **production-grade caching patterns** in Node.js and Express, built with a resilient dual-engine architecture:
- **Redis (`ioredis`)**: Used when a Redis server is available (via `REDIS_URL` or default `localhost:6379`).
- **In-Memory Fallback (`Map` with TTL eviction)**: Automatically activates if Redis is offline, allowing code to run anywhere with zero configuration.

---

## 🏗️ Architecture & Core Patterns

### 1. The Cache-Aside Pattern (Lazy Loading)
In this pattern, the application code sits between the cache and the primary database:

```
[ Client Request ]
       │
       ▼
[ Cache Check ] ─── Hit? ───► [ Return Cached Response (1-3ms) ]
       │ No (Miss)
       ▼
[ Query Primary Database (e.g., 500ms) ]
       │
       ├─► [ Save in Cache with TTL (e.g. 60s) ]
       │
       ▼
[ Return Fresh Data to Client ]
```

### 2. Cache Invalidation on Mutations
When data is updated (`POST`, `PUT`, `DELETE`), related cache keys are purged so clients never receive stale representations:
```javascript
// Purge cached product queries after adding a new product
await cacheClient.delPattern('cache:express:/api/products*');
```

### 3. Response Diagnostic Headers
All cached endpoints include metadata headers:
- `X-Cache: HIT` / `X-Cache: MISS`
- `X-Response-Time: <duration>ms`

---

## 🚀 Running the Server

Start the caching server on port **3006**:

```bash
# from repository root
npm run start:cache
```

Once running, visit the interactive web dashboard at:
👉 **[http://localhost:3006](http://localhost:3006)**

---

## 🧪 Testing with cURL / HTTP Requests

### 1. Testing Cache Miss vs. Cache Hit
```bash
# First request: Cache MISS (~500ms response time)
curl -i http://localhost:3006/api/products

# Second request: Cache HIT (<3ms response time)
curl -i http://localhost:3006/api/products
```

### 2. Heavy Computation Caching (Fibonacci)
```bash
# Compute heavy Fibonacci sequence (Miss)
curl -i "http://localhost:3006/api/fibonacci?n=37"

# Second call returns instant cached result (Hit)
curl -i "http://localhost:3006/api/fibonacci?n=37"
```

### 3. Inspect Live Telemetry
```bash
curl http://localhost:3006/api/cache/stats
```
Expected output:
```json
{
  "status": "success",
  "stats": {
    "engine": "memory",
    "totalRequests": 4,
    "hits": 2,
    "misses": 2,
    "hitRatio": "50.0%",
    "keysCount": 2
  }
}
```

### 4. Invalidate Cache via Mutation
```bash
curl -X POST http://localhost:3006/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Mechanical Keyboard", "category": "Accessories", "price": 129}'
```

---

## 📁 Key Files in this Section

- `cacheClient.js`: Unified cache client adapter supporting Redis and In-Memory fallback.
- `cacheMiddleware.js`: Express route middleware caching responses based on `req.originalUrl`.
- `server.js`: Express demo server featuring simulated slow DB queries and heavy computations.
- `public/index.html`: Real-time interactive telemetry dashboard with live latency benchmarking.
- `cache.test.js`: Jest & Supertest automated test suite.
