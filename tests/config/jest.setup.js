import { jest } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (!process.env.DB_URL) {
  process.env.DB_URL = 'mongodb://localhost:27017/mtgv_test';
  process.env.NODE_ENV = 'test';
}

// Mock Redis to prevent connection attempts during tests
jest.mock('ioredis', () => {
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
  
  return jest.fn(() => mockRedisClient);
});