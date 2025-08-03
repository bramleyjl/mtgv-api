// Mock Redis client for testing
const mockRedisClient = {
  on: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  quit: jest.fn(),
  disconnect: jest.fn(),
  connect: jest.fn(),
  isOpen: true,
  isReady: true
};

// Mock Redis constructor
const mockRedis = jest.fn(() => mockRedisClient);

export default mockRedis;
export { mockRedisClient }; 