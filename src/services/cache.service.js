const { getRedisClient } = require('../config/cache');
const logger = require('../config/logger');

const DEFAULT_TTL = 300; // 5 minutes

const get = async (key) => {
  try {
    const redis = getRedisClient();
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.warn('Cache GET error', { key, err: err.message });
    return null;
  }
};

const set = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    const redis = getRedisClient();
    await redis.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    logger.warn('Cache SET error', { key, err: err.message });
  }
};

const del = async (key) => {
  try {
    const redis = getRedisClient();
    await redis.del(key);
  } catch (err) {
    logger.warn('Cache DEL error', { key, err: err.message });
  }
};

const invalidatePattern = async (pattern) => {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (err) {
    logger.warn('Cache invalidatePattern error', { pattern, err: err.message });
  }
};

module.exports = { get, set, del, invalidatePattern };
