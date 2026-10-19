const Redis = require('ioredis');

let redisClient = null;
let isRedisConnected = false;

// In-memory fallback store when Redis is not available
const memoryStore = new Map();
const memoryExpiries = new Map();

const initRedis = () => {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          // Do not spam reconnects if Redis server isn't running locally
          return null;
        }
        return Math.min(times * 100, 2000);
      },
      enableOfflineQueue: false,
      lazyConnect: true
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('[Redis] Connected successfully');
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      // Suppress noisy ECONNREFUSED in local dev
      if (process.env.NODE_ENV !== 'production' && err.code === 'ECONNREFUSED') {
        // quiet fallback
      } else {
        console.warn(`[Redis] Cache fallback active (${err.message})`);
      }
    });

    redisClient.connect().catch(() => {
      isRedisConnected = false;
    });
  } catch (err) {
    isRedisConnected = false;
  }

  return redisClient;
};

// Start client connection attempt
initRedis();

const getClient = () => redisClient;
const isConnected = () => isRedisConnected;

module.exports = {
  initRedis,
  getClient,
  isConnected,
  memoryStore,
  memoryExpiries
};
