import Redis from 'ioredis';

let redisClient = null;

// Only create Redis client if REDIS_URL is provided
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
  
  redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
  });
  
  redisClient.on('connect', () => {
    console.log('Redis connected successfully');
  });
} else {
  console.log('REDIS_URL not provided, Redis caching disabled');
}

// Export a wrapper that handles Redis being unavailable
const redisWrapper = {
  get: async (key) => {
    if (!redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },
  
  set: async (key, value, ttl = null) => {
    if (!redisClient) return;
    try {
      if (ttl) {
        await redisClient.setex(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  },
  
  del: async (key) => {
    if (!redisClient) return;
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  },
  
  // Check if Redis is available
  isAvailable: () => !!redisClient
};

export default redisWrapper; 