const crypto = require('crypto');
const { getClient, isConnected, memoryStore, memoryExpiries } = require('../config/redis');

/**
 * Generate a deterministic hash key for AI caching
 */
const generateCacheKey = (prefix, ...inputs) => {
  const combined = inputs
    .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item || '')))
    .join(':::');
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  return `resumeiq:${prefix}:${hash}`;
};

/**
 * Retrieve cached JSON value
 */
const getCache = async (key) => {
  try {
    const client = getClient();
    if (isConnected() && client) {
      const data = await client.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    }

    // Memory fallback
    const expiry = memoryExpiries.get(key);
    if (expiry && Date.now() > expiry) {
      memoryStore.delete(key);
      memoryExpiries.delete(key);
      return null;
    }
    const val = memoryStore.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    console.warn(`[Cache Error on get] ${err.message}`);
    return null;
  }
};

/**
 * Set cached JSON value with TTL in seconds (default 12 hours)
 */
const setCache = async (key, data, ttlSeconds = 43200) => {
  try {
    const serialized = JSON.stringify(data);
    const client = getClient();

    if (isConnected() && client) {
      await client.set(key, serialized, 'EX', ttlSeconds);
      return true;
    }

    // Memory fallback
    memoryStore.set(key, serialized);
    memoryExpiries.set(key, Date.now() + ttlSeconds * 1000);

    // Bound memory store size
    if (memoryStore.size > 2000) {
      const oldestKey = memoryStore.keys().next().value;
      memoryStore.delete(oldestKey);
      memoryExpiries.delete(oldestKey);
    }
    return true;
  } catch (err) {
    console.warn(`[Cache Error on set] ${err.message}`);
    return false;
  }
};

/**
 * Invalidate a specific cache key
 */
const invalidateCache = async (key) => {
  try {
    const client = getClient();
    if (isConnected() && client) {
      await client.del(key);
    }
    memoryStore.delete(key);
    memoryExpiries.delete(key);
    return true;
  } catch (err) {
    console.warn(`[Cache Error on invalidate] ${err.message}`);
    return false;
  }
};

module.exports = {
  generateCacheKey,
  getCache,
  setCache,
  invalidateCache
};
