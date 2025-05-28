import CardPackageCreator from '../../src/services/cardPackageCreator.js';
import Card from '../../src/models/card.js';

jest.mock('../../src/models/card.js');

describe('CardPackageCreator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('perform', () => {
    it('should create a card package with found cards', async () => {
      // Arrange
      const cardList = [{ name: 'Test Card', count: 1 }];
      const games = ['paper'];
      const defaultSelection = 'newest';

      // Setup mock for find_by on Card instance
      Card.mockImplementation(() => ({
        find_by: jest.fn().mockResolvedValue([
          {
            oracle_id: ['test-id'],
            name: 'Test Card',
            scryfall_id: 'test-scryfall-id'
          }
        ])
      }));

      // Act
      const result = await CardPackageCreator.perform(cardList, games, defaultSelection);

      // Assert
      expect(result).toHaveProperty('cardList', cardList);
      expect(result).toHaveProperty('games', games);
      expect(result).toHaveProperty('default_selection', defaultSelection);
      expect(result).toHaveProperty('package_entries');
      expect(result.package_entries).toHaveLength(1);
      expect(result.package_entries[0]).toEqual({
        count: 1,
        oracle_id: ['test-id'],
        name: 'Test Card',
        card_prints: [
          {
            oracle_id: ['test-id'],
            name: 'Test Card',
            scryfall_id: 'test-scryfall-id'
          }
        ],
        selected_print: 'test-scryfall-id',
        user_selected: false,
      });
    });

    it('should create a card package with an empty package entry when no cards are found', async () => {
      // Arrange
      const cardList = [{ name: 'Missing Card', count: 2 }];
      const games = ['paper'];
      const defaultSelection = 'newest';

      Card.mockImplementation(() => ({
        find_by: jest.fn().mockResolvedValue([])
      }));

      // Act
      const result = await CardPackageCreator.perform(cardList, games, defaultSelection);

      // Assert
      expect(result).toHaveProperty('cardList', cardList);
      expect(result).toHaveProperty('games', games);
      expect(result).toHaveProperty('default_selection', defaultSelection);
      expect(result).toHaveProperty('package_entries');
      expect(result.package_entries).toHaveLength(1);
      expect(result.package_entries[0]).toEqual({
        count: 2,
        oracle_id: null,
        name: 'Missing Card',
        card_prints: [],
        selected_print: null,
        user_selected: false,
        not_found: true,
      });
    });
  });

  describe('perform_random', () => {
    it('should create a random card package with found cards', async () => {
      // Arrange
      const cardListCount = 3;
      const games = ['paper', 'mtgo'];
      const defaultSelection = 'newest';

      // Setup mock for both find_random and find_by on a Card instance
      Card.mockImplementation(() => ({
        find_random: jest.fn().mockResolvedValue([{ name: 'Random Test Card', count: 1 }]),
        find_by: jest.fn().mockResolvedValue([
          {
            oracle_id: ['random-test-id'],
            name: 'Random Test Card',
            scryfall_id: 'random-test-scryfall-id'
          }
        ])
      }));

      // Act
      const result = await CardPackageCreator.perform_random(cardListCount, games, defaultSelection);

      // Assert
      expect(result).toHaveProperty('cardList');
      expect(result.cardList).toEqual([{ name: 'Random Test Card', count: 1 }]);
      expect(result).toHaveProperty('games', games);
      expect(result).toHaveProperty('default_selection', defaultSelection);
      expect(result).toHaveProperty('package_entries');
      expect(result.package_entries).toHaveLength(1);
      expect(result.package_entries[0]).toEqual({
        count: 1,
        oracle_id: ['random-test-id'],
        name: 'Random Test Card',
        card_prints: [
          {
            oracle_id: ['random-test-id'],
            name: 'Random Test Card',
            scryfall_id: 'random-test-scryfall-id'
          }
        ],
        selected_print: 'random-test-scryfall-id',
        user_selected: false,
      });
    });

    it('should create a random card package with an empty package entry when no cards are found', async () => {
      // Arrange
      const cardListCount = 2;
      const games = ['paper'];
      const defaultSelection = 'newest';

      Card.mockImplementation(() => ({
        find_random: jest.fn().mockResolvedValue([{ name: 'Missing Card', count: 2 }]),
        find_by: jest.fn().mockResolvedValue([])
      }));

      // Act
      const result = await CardPackageCreator.perform_random(cardListCount, games, defaultSelection);

      // Assert
      expect(result).toHaveProperty('cardList');
      expect(result.cardList).toEqual([{ name: 'Missing Card', count: 2 }]);
      expect(result).toHaveProperty('games', games);
      expect(result).toHaveProperty('default_selection', defaultSelection);
      expect(result).toHaveProperty('package_entries');
      expect(result.package_entries).toHaveLength(1);
      expect(result.package_entries[0]).toEqual({
        count: 2,
        oracle_id: null,
        name: 'Missing Card',
        card_prints: [],
        selected_print: null,
        user_selected: false,
        not_found: true,
      });
    });
  });
});