import assert from 'assert';
import sinon from 'sinon';
import cardsController from '../../src/controllers/cardsController.js';
import Card from '../../src/models/card.js';

// Mock the database module
import database from '../../src/db/database.js';
sinon.stub(database, 'getCollection').resolves({
  aggregate: () => ({
    toArray: () => Promise.resolve([])
  }),
  find: () => ({
    toArray: () => Promise.resolve([])
  }),
  findOne: () => Promise.resolve(null)
});

describe('cardsController', function() {
  let mockReq;
  let mockRes;
  let mockNext;
  let searchByNameStub;

  beforeEach(function() {
    mockReq = {
      validatedQuery: 'lightning',
      query: {
        unique_names_only: 'true'
      }
    };
    mockRes = {
      json: sinon.spy()
    };
    mockNext = sinon.spy();
    
    // Stub the searchByName method on Card prototype
    searchByNameStub = sinon.stub(Card.prototype, 'searchByName');
  });

  afterEach(function() {
    sinon.restore();
  });

  describe('searchCards', function() {
    it('should return search results successfully', async function() {
      const mockCards = [
        {
          id: 'card1',
          name: 'Lightning Bolt',
          set: 'LEA',
          set_name: 'Limited Edition Alpha',
          collector_number: '81'
        }
      ];
      
      searchByNameStub.resolves(mockCards);
      
      await cardsController.searchCards(mockReq, mockRes, mockNext);
      
      assert(searchByNameStub.calledWith('lightning', true));
      assert(mockRes.json.calledWith({
        cards: mockCards,
        total: 1,
        query: 'lightning',
        sanitized_query: 'lightning',
        unique_names_only: true
      }));
      assert(mockNext.notCalled);
    });

    it('should handle unique_names_only=false parameter', async function() {
      mockReq.query.unique_names_only = 'false';
      const mockCards = [
        {
          id: 'card1',
          name: 'Lightning Bolt',
          set: 'LEA',
          set_name: 'Limited Edition Alpha',
          collector_number: '81'
        },
        {
          id: 'card2',
          name: 'Lightning Bolt',
          set: 'LEB',
          set_name: 'Limited Edition Beta',
          collector_number: '81'
        }
      ];
      
      searchByNameStub.resolves(mockCards);
      
      await cardsController.searchCards(mockReq, mockRes, mockNext);
      
      assert(searchByNameStub.calledWith('lightning', false));
      assert(mockRes.json.calledWith({
        cards: mockCards,
        total: 2,
        query: 'lightning',
        sanitized_query: 'lightning',
        unique_names_only: false
      }));
    });

    it('should handle missing unique_names_only parameter (defaults to true)', async function() {
      delete mockReq.query.unique_names_only;
      const mockCards = [
        {
          id: 'card1',
          name: 'Lightning Bolt',
          set: 'LEA',
          set_name: 'Limited Edition Alpha',
          collector_number: '81'
        }
      ];
      
      searchByNameStub.resolves(mockCards);
      
      await cardsController.searchCards(mockReq, mockRes, mockNext);
      
      assert(searchByNameStub.calledWith('lightning', true));
      assert(mockRes.json.calledWith({
        cards: mockCards,
        total: 1,
        query: 'lightning',
        sanitized_query: 'lightning',
        unique_names_only: true
      }));
    });

    it('should handle empty search results', async function() {
      searchByNameStub.resolves([]);
      
      await cardsController.searchCards(mockReq, mockRes, mockNext);
      
      assert(searchByNameStub.calledWith('lightning', true));
      assert(mockRes.json.calledWith({
        cards: [],
        total: 0,
        query: 'lightning',
        sanitized_query: 'lightning',
        unique_names_only: true
      }));
    });

    it('should handle query with special characters', async function() {
      mockReq.validatedQuery = 'lightning-bolt!';
      const mockCards = [
        {
          id: 'card1',
          name: 'Lightning Bolt',
          set: 'LEA',
          set_name: 'Limited Edition Alpha',
          collector_number: '81'
        }
      ];
      
      searchByNameStub.resolves(mockCards);
      
      await cardsController.searchCards(mockReq, mockRes, mockNext);
      
      assert(searchByNameStub.calledWith('lightningbolt', true));
      assert(mockRes.json.calledWith({
        cards: mockCards,
        total: 1,
        query: 'lightning-bolt!',
        sanitized_query: 'lightningbolt',
        unique_names_only: true
      }));
    });

    it('should handle query with spaces', async function() {
      mockReq.validatedQuery = 'black lotus';
      const mockCards = [
        {
          id: 'card1',
          name: 'Black Lotus',
          set: 'LEA',
          set_name: 'Limited Edition Alpha',
          collector_number: '232'
        }
      ];
      
      searchByNameStub.resolves(mockCards);
      
      await cardsController.searchCards(mockReq, mockRes, mockNext);
      
      assert(searchByNameStub.calledWith('black_lotus', true));
      assert(mockRes.json.calledWith({
        cards: mockCards,
        total: 1,
        query: 'black lotus',
        sanitized_query: 'black_lotus',
        unique_names_only: true
      }));
    });

    it('should handle database errors', async function() {
      const dbError = new Error('Database connection failed');
      searchByNameStub.rejects(dbError);
      
      await cardsController.searchCards(mockReq, mockRes, mockNext);
      
      assert(searchByNameStub.calledWith('lightning', true));
      assert(mockRes.json.notCalled);
      assert(mockNext.calledWith(dbError));
    });
  });
}); 