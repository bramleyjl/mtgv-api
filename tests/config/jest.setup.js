import { jest } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (!process.env.DB_URL) {
  process.env.DB_URL = 'mongodb://localhost:27017/mtgv_test';
  process.env.NODE_ENV = 'test';
}