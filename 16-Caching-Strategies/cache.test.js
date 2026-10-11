const request = require('supertest');
const app = require('./server');
const { cacheClient } = require('./cacheClient');

describe('Section 16: Caching Strategies & Telemetry Test Suite', () => {
  beforeEach(async () => {
    // Flush cache before each test for clean deterministic state
    await cacheClient.flush();
    cacheClient.resetStats();
  });

  afterAll(async () => {
    await cacheClient.flush();
    if (cacheClient.redisClient) {
      try {
        await cacheClient.redisClient.quit();
      } catch (_) {}
    }
  });

  describe('Route-Level Caching (Cache-Aside)', () => {
    it('should result in Cache MISS on initial request and Cache HIT on subsequent request', async () => {
      // 1st request: Cache Miss
      const res1 = await request(app).get('/api/products');
      expect(res1.status).toBe(200);
      expect(res1.headers['x-cache']).toBe('MISS');
      expect(res1.body.status).toBe('success');
      expect(Array.isArray(res1.body.data)).toBe(true);

      // 2nd request: Cache Hit
      const res2 = await request(app).get('/api/products');
      expect(res2.status).toBe(200);
      expect(res2.headers['x-cache']).toBe('HIT');
      expect(res2.body.data).toEqual(res1.body.data);
    });

    it('should cache single product endpoint independently', async () => {
      // 1st request
      const res1 = await request(app).get('/api/products/1');
      expect(res1.status).toBe(200);
      expect(res1.headers['x-cache']).toBe('MISS');
      expect(res1.body.data.id).toBe(1);

      // 2nd request
      const res2 = await request(app).get('/api/products/1');
      expect(res2.status).toBe(200);
      expect(res2.headers['x-cache']).toBe('HIT');
      expect(res2.body.data.id).toBe(1);
    });
  });

  describe('Proactive Cache Invalidation', () => {
    it('should invalidate product cache when a new product is created', async () => {
      // Warm the cache
      const warmRes = await request(app).get('/api/products');
      expect(warmRes.headers['x-cache']).toBe('MISS');

      const hitRes = await request(app).get('/api/products');
      expect(hitRes.headers['x-cache']).toBe('HIT');

      // Create new product to trigger invalidation
      const createRes = await request(app)
        .post('/api/products')
        .send({
          name: 'Magic Trackpad 3',
          category: 'Accessories',
          price: 149
        });
      expect(createRes.status).toBe(201);

      // Next GET request must be a Cache MISS because cache was invalidated
      const postInvalidateRes = await request(app).get('/api/products');
      expect(postInvalidateRes.headers['x-cache']).toBe('MISS');
      const names = postInvalidateRes.body.data.map((p) => p.name);
      expect(names).toContain('Magic Trackpad 3');
    });
  });

  describe('Heavy Calculation Caching (Fibonacci)', () => {
    it('should cache computationally heavy results', async () => {
      const res1 = await request(app).get('/api/fibonacci?n=15');
      expect(res1.status).toBe(200);
      expect(res1.headers['x-cache']).toBe('MISS');
      expect(res1.body.result).toBe(610);

      const res2 = await request(app).get('/api/fibonacci?n=15');
      expect(res2.status).toBe(200);
      expect(res2.headers['x-cache']).toBe('HIT');
      expect(res2.body.result).toBe(610);
    });
  });

  describe('Cache Management & Telemetry Stats', () => {
    it('should track hits, misses, and allow flushing the cache', async () => {
      // Generate 1 miss, 1 hit
      await request(app).get('/api/products');
      await request(app).get('/api/products');

      const statsRes = await request(app).get('/api/cache/stats');
      expect(statsRes.status).toBe(200);
      expect(statsRes.body.stats.hits).toBe(1);
      expect(statsRes.body.stats.misses).toBe(1);

      // Flush cache
      const flushRes = await request(app).post('/api/cache/flush');
      expect(flushRes.status).toBe(200);
      expect(flushRes.body.message).toContain('flushed');

      // After flush, request should be a MISS again
      const afterFlush = await request(app).get('/api/products');
      expect(afterFlush.headers['x-cache']).toBe('MISS');
    });
  });
});
