import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import Card from '../../src/models/card.js';
import database from '../../src/lib/database.js';

describe('Card Model', () => {
  let mongoServer;
  let connection;
  let db;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    connection = await MongoClient.connect(uri);
    db = connection.db();
    
    // Mock the database connection
    jest.spyOn(database, 'getCollection').mockImplementation(
      (name) => db.collection(name)
    );
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await db.collection('cards').deleteMany({});
  });

  describe('find_by', () => {
    it('should find cards by name', async () => {
      // Insert test data
      await db.collection('cards').insertMany([
        {
          name: 'Test Card',
          sanitized_name: 'test_card',
          games: ['paper'],
          prices: {
            usd: { $numberDecimal: '10.00' },
            tix: { $numberDecimal: '5.00' }
          }
        },
        {
          name: 'Another Card',
          sanitized_name: 'another_card',
          games: ['paper'],
          prices: {
            usd: { $numberDecimal: '20.00' },
            tix: { $numberDecimal: '10.00' }
          }
        }
      ]);

      const card = new Card();
      const results = await card.find_by({ sanitized_name: 'test_card' });

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Test Card');
      expect(results[0].prices.usd).toBe('10.00'); // Should be formatted as string
    });

    // More tests for find_by with sorting, etc.
  });

  // Tests for other methods
});