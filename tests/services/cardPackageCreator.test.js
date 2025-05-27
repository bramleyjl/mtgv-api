import CardPackageCreator from '../../src/services/cardPackageCreator.js';
import Card from '../../src/models/card.js';

jest.mock('../../src/models/card.js');

describe('CardPackageCreator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildQueryForCardPrints', () => {
    it('should build a query for most expensive card with paper game', () => {
      const entry = { name: 'Test Card', count: 1 };
      const games = ['paper'];
      const defaultSelection = 'most_expensive';

      const query = CardPackageCreator.buildQueryForCardPrints(entry, games, defaultSelection);

      expect(query).toEqual({
        sanitized_name: 'test_card',
        games: { $in: ['paper'] },
        sort: { 'prices.usd': -1 }
      });
    });

    it('should build a query for most expensive card with mtgo game only', () => {
      const entry = { name: 'Test Card', count: 1 };
      const games = ['mtgo'];
      const defaultSelection = 'most_expensive';

      const query = CardPackageCreator.buildQueryForCardPrints(entry, games, defaultSelection);

      expect(query).toEqual({
        sanitized_name: 'test_card',
        games: { $in: ['mtgo'] },
        sort: { 'prices.tix': -1 }
      });
    });

    // More tests for other sorting options
  });

  describe('perform', () => {
    it('should create a card package with found cards', async () => {
      const cardList = [{ name: 'Test Card', count: 1 }];
      const games = ['paper'];
      const defaultSelection = 'newest';

      // Mock find_by to return some cards
      const mockCardInstance = { find_by: jest.fn() };
      Card.mockImplementation(() => mockCardInstance);
      mockCardInstance.find_by.mockResolvedValue([
        { 
          oracle_id: ['test-id'], 
          name: 'Test Card',
          scryfall_id: 'test-scryfall-id',
          // Other card properties
        }
      ]);

      const result = await CardPackageCreator.perform(cardList, games, defaultSelection);

      expect(result).toHaveProperty('cardList');
      expect(result).toHaveProperty('games');
      expect(result).toHaveProperty('default_selection');
      expect(result).toHaveProperty('package_entries');
      expect(result.package_entries).toHaveLength(1);
    });

    // More tests for perform
  });

  // Tests for other methods
});