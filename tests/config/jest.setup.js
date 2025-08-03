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

// Mock MongoDB to prevent connection attempts during tests
jest.mock('mongodb', () => {
  const originalModule = jest.requireActual('mongodb');
  return {
    ...originalModule,
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          aggregate: () => ({
            toArray: () => Promise.resolve([])
          }),
          find: () => ({
            toArray: () => Promise.resolve([])
          }),
          findOne: () => Promise.resolve(null),
          insertMany: jest.fn().mockResolvedValue({ insertedCount: 0 }),
          deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 })
        })
      })
    }))
  };
});