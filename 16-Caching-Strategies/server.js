/**
 * Section 16: Caching Strategies & Performance Optimization Server
 * ----------------------------------------------------------------
 * Demonstrates:
 * 1. Cache-Aside pattern (Lazy Loading) with TTL.
 * 2. Express route-level caching middleware with X-Cache response headers.
 * 3. Proactive Cache Invalidation on data mutations (POST, PUT, DELETE).
 * 4. Simulated slow database queries and heavy CPU computation caching.
 * 5. Live cache telemetry (Hits, Misses, Hit Ratio, Engine).
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const { cacheClient } = require('./cacheClient');
const { cacheMiddleware } = require('./cacheMiddleware');

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Simulated Database with deliberate latency to illustrate real-world database load
let productsDb = [
  { id: 1, name: 'MacBook Pro 16"', category: 'Laptops', price: 2499, inStock: true },
  { id: 2, name: 'Sony WH-1000XM5', category: 'Audio', price: 399, inStock: true },
  { id: 3, name: 'Dell UltraSharp 32" 4K', category: 'Monitors', price: 849, inStock: false },
  { id: 4, name: 'Keychron Q1 Pro Mechanical Keyboard', category: 'Accessories', price: 199, inStock: true },
  { id: 5, name: 'Logitech MX Master 3S', category: 'Accessories', price: 99, inStock: true }
];

/**
 * Simulates real-world database query delay or heavy I/O
 */
const simulateDbLatency = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Recursive Fibonacci for heavy CPU calculation demo
function calculateFibonacci(n) {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

// ==========================================
// 1. Cached Product Routes (Cache-Aside)
// ==========================================

// GET /api/products - Caches product listing for 30 seconds
app.get('/api/products', cacheMiddleware(30), async (req, res) => {
  // Simulate slow database query (500ms delay)
  await simulateDbLatency(500);

  const { category } = req.query;
  let results = productsDb;
  if (category) {
    results = productsDb.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  res.json({
    status: 'success',
    count: results.length,
    source: 'Database Query (Simulated 500ms latency)',
    data: results
  });
});

// GET /api/products/:id - Caches single product for 30 seconds
app.get('/api/products/:id', cacheMiddleware(30), async (req, res) => {
  await simulateDbLatency(300);

  const id = parseInt(req.params.id, 10);
  const product = productsDb.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ status: 'error', message: `Product #${id} not found.` });
  }

  res.json({
    status: 'success',
    source: 'Database Query (Simulated 300ms latency)',
    data: product
  });
});

// ==========================================
// 2. Cache Invalidation on Mutations
// ==========================================

// POST /api/products - Creates a product and invalidates cached listings
app.post('/api/products', async (req, res) => {
  const { name, category, price, inStock } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ status: 'error', message: 'Name and price are required.' });
  }

  const newProduct = {
    id: Date.now(),
    name,
    category: category || 'General',
    price: Number(price),
    inStock: inStock !== undefined ? Boolean(inStock) : true
  };

  productsDb.push(newProduct);

  // Proactive Cache Invalidation: clear all product listing cache entries
  await cacheClient.delPattern('cache:express:/api/products*');

  res.status(201).json({
    status: 'success',
    message: 'Product created successfully. Related cache keys invalidated.',
    data: newProduct
  });
});

// PUT /api/products/:id - Updates product and invalidates its cache and listings
app.put('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = productsDb.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ status: 'error', message: `Product #${id} not found.` });
  }

  productsDb[index] = { ...productsDb[index], ...req.body, id };

  // Invalidate specific product cache and all listing caches
  await cacheClient.delPattern(`cache:express:/api/products*`);

  res.json({
    status: 'success',
    message: `Product #${id} updated. Cache invalidated.`,
    data: productsDb[index]
  });
});

// DELETE /api/products/:id - Deletes product and invalidates cache
app.delete('/api/products/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const exists = productsDb.some(p => p.id === id);

  if (!exists) {
    return res.status(404).json({ status: 'error', message: `Product #${id} not found.` });
  }

  productsDb = productsDb.filter(p => p.id !== id);

  // Invalidate cache
  await cacheClient.delPattern('cache:express:/api/products*');

  res.json({
    status: 'success',
    message: `Product #${id} deleted. Cache invalidated.`
  });
});

// ==========================================
// 3. Heavy Computation Caching Demo
// ==========================================

// GET /api/fibonacci?n=38&useCache=true
app.get('/api/fibonacci', async (req, res) => {
  const n = parseInt(req.query.n || '36', 10);
  const useCache = req.query.useCache !== 'false';

  if (n < 1 || n > 42) {
    return res.status(400).json({ status: 'error', message: 'Parameter n must be between 1 and 42 to prevent crash.' });
  }

  const cacheKey = `compute:fib:${n}`;
  const startTime = Date.now();

  if (useCache) {
    const cachedResult = await cacheClient.get(cacheKey);
    if (cachedResult !== null) {
      const duration = Date.now() - startTime;
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Response-Time', `${duration}ms`);
      return res.json({
        status: 'success',
        n,
        result: cachedResult,
        cached: true,
        executionTime: `${duration}ms`
      });
    }
  }

  // Heavy CPU work
  const result = calculateFibonacci(n);
  const duration = Date.now() - startTime;

  if (useCache) {
    await cacheClient.set(cacheKey, result, 120); // 2 minutes TTL
  }

  res.setHeader('X-Cache', 'MISS');
  res.setHeader('X-Response-Time', `${duration}ms`);
  res.json({
    status: 'success',
    n,
    result,
    cached: false,
    executionTime: `${duration}ms`
  });
});

// ==========================================
// 4. Cache Telemetry & Management Endpoints
// ==========================================

// GET /api/cache/stats - Live telemetry
app.get('/api/cache/stats', (req, res) => {
  res.json({
    status: 'success',
    stats: cacheClient.getStats()
  });
});

// POST /api/cache/flush - Clear all cache entries
app.post('/api/cache/flush', async (req, res) => {
  await cacheClient.flush();
  cacheClient.resetStats();
  res.json({
    status: 'success',
    message: 'Cache successfully flushed and statistics reset.'
  });
});

// Only start the HTTP listener if this file was executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Section 16: Caching Strategies Server running!`);
    console.log(`🌐 Dashboard UI: http://localhost:${PORT}`);
    console.log(`📦 Engine: ${cacheClient.engine.toUpperCase()} (with auto-fallback)`);
    console.log(`======================================================\n`);
  });
}

module.exports = app;
