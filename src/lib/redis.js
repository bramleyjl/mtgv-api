import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.on('close', () => {
  console.log('Redis client connection closed');
});

export default redisClient; 