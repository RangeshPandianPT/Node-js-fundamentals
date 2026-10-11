/**
 * Section 16: Express Caching Middleware
 * --------------------------------------
 * Automatically caches response bodies for GET requests based on req.originalUrl.
 * Injects diagnostic headers:
 * - `X-Cache: HIT` or `X-Cache: MISS`
 * - `X-Response-Time: <duration>ms`
 */

const { cacheClient } = require('./cacheClient');

/**
 * Creates an Express middleware for route-level caching.
 * @param {number} ttlSeconds - Duration in seconds to store the cached response.
 * @param {string} prefix - Custom key prefix for cache namespace.
 */
function cacheMiddleware(ttlSeconds = 60, prefix = 'cache:express:') {
  return async (req, res, next) => {
    // Only cache safe, idempotent GET and HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    const cacheKey = `${prefix}${req.originalUrl}`;
    const startTime = Date.now();

    try {
      const cachedData = await cacheClient.get(cacheKey);

      if (cachedData !== null) {
        const duration = Date.now() - startTime;
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Response-Time', `${duration}ms`);
        return res.json(cachedData);
      }

      // Cache miss - intercept response
      res.setHeader('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        const duration = Date.now() - startTime;
        res.setHeader('X-Response-Time', `${duration}ms`);

        // Only cache successful 200 responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheClient.set(cacheKey, body, ttlSeconds).catch((err) => {
            console.error('[cacheMiddleware] Failed to store cache:', err);
          });
        }

        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('[cacheMiddleware] Error during cache lookup:', err);
      next();
    }
  };
}

module.exports = {
  cacheMiddleware
};
