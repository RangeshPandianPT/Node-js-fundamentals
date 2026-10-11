/**
 * Section 16: Caching Strategies - Unified Cache Client
 * ----------------------------------------------------
 * Provides a unified caching layer supporting Redis via `ioredis`
 * with automatic, seamless fallback to an In-Memory cache store.
 * 
 * Features:
 * - Transparent get/set/del/delPattern/flush API.
 * - TTL (Time-To-Live in seconds) support.
 * - Live hit/miss and engine telemetry stats.
 * - Zero external dependency requirement (works out of the box).
 */

const Redis = require('ioredis');

class InMemoryStore {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    return item;
  }

  set(key, value, ttlSeconds = 60) {
    this.store.set(key, value);

    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    if (ttlSeconds > 0) {
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.timers.delete(key);
      }, ttlSeconds * 1000);

      // Unref to avoid preventing process exit
      if (timer.unref) timer.unref();
      this.timers.set(key, timer);
    }
  }

  del(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.store.delete(key);
  }

  delPattern(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let count = 0;
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.del(key);
        count++;
      }
    }
    return count;
  }

  flush() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    const count = this.store.size;
    this.store.clear();
    return count;
  }

  keysCount() {
    return this.store.size;
  }
}

class CacheService {
  constructor(options = {}) {
    this.redisUrl = options.redisUrl || process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    this.preferRedis = options.preferRedis !== false;
    this.memoryStore = new InMemoryStore();
    this.redisClient = null;
    this.engine = 'memory'; // 'redis' | 'memory'
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
    };

    if (this.preferRedis) {
      this.initRedis();
    }
  }

  initRedis() {
    try {
      this.redisClient = new Redis(this.redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 800,
        lazyConnect: true,
        retryStrategy: () => null // Do not keep retrying continuously if Redis is down
      });

      this.redisClient.connect()
        .then(() => {
          this.engine = 'redis';
          console.log(`[CacheService] Connected to Redis instance at ${this.redisUrl}`);
        })
        .catch(() => {
          this.engine = 'memory';
          // Disconnect client to avoid lingering listeners
          try { this.redisClient.disconnect(); } catch (_) {}
          this.redisClient = null;
          console.log('[CacheService] Redis unavailable. Falling back seamlessly to In-Memory cache engine.');
        });

      this.redisClient.on('error', () => {
        if (this.engine === 'redis') {
          console.warn('[CacheService] Redis disconnected. Switching to In-Memory store.');
          this.engine = 'memory';
        }
      });
    } catch (_) {
      this.engine = 'memory';
    }
  }

  async get(key) {
    this.stats.totalRequests++;
    try {
      if (this.engine === 'redis' && this.redisClient) {
        const raw = await this.redisClient.get(key);
        if (raw !== null) {
          this.stats.hits++;
          return JSON.parse(raw);
        }
      } else {
        const item = this.memoryStore.get(key);
        if (item !== null && item !== undefined) {
          this.stats.hits++;
          return item;
        }
      }
    } catch (err) {
      console.error(`[CacheService] Error reading key "${key}":`, err.message);
    }

    this.stats.misses++;
    return null;
  }

  async set(key, value, ttlSeconds = 60) {
    try {
      if (this.engine === 'redis' && this.redisClient) {
        const payload = JSON.stringify(value);
        if (ttlSeconds > 0) {
          await this.redisClient.set(key, payload, 'EX', ttlSeconds);
        } else {
          await this.redisClient.set(key, payload);
        }
        return true;
      } else {
        this.memoryStore.set(key, value, ttlSeconds);
        return true;
      }
    } catch (err) {
      console.error(`[CacheService] Error setting key "${key}":`, err.message);
      // Fallback to memory on Redis write failure
      this.memoryStore.set(key, value, ttlSeconds);
      return false;
    }
  }

  async del(key) {
    try {
      if (this.engine === 'redis' && this.redisClient) {
        await this.redisClient.del(key);
      }
      this.memoryStore.del(key);
      return true;
    } catch (err) {
      console.error(`[CacheService] Error deleting key "${key}":`, err.message);
      return false;
    }
  }

  async delPattern(pattern) {
    try {
      if (this.engine === 'redis' && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      }
      return this.memoryStore.delPattern(pattern);
    } catch (err) {
      console.error(`[CacheService] Error deleting pattern "${pattern}":`, err.message);
      return this.memoryStore.delPattern(pattern);
    }
  }

  async flush() {
    try {
      if (this.engine === 'redis' && this.redisClient) {
        await this.redisClient.flushdb();
      }
      this.memoryStore.flush();
      return true;
    } catch (err) {
      console.error('[CacheService] Error flushing cache:', err.message);
      return false;
    }
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRatio = total > 0 ? ((this.stats.hits / total) * 100).toFixed(1) + '%' : '0.0%';

    return {
      engine: this.engine,
      totalRequests: this.stats.totalRequests,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRatio,
      keysCount: this.memoryStore.keysCount(),
    };
  }

  resetStats() {
    this.stats.hits = 0;
    this.stats.misses = 0;
    this.stats.totalRequests = 0;
  }
}

// Export singleton instance and class definition
const defaultCache = new CacheService();
module.exports = {
  CacheService,
  cacheClient: defaultCache
};
