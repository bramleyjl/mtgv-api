import assert from 'assert';
import sinon from 'sinon';
import CardPackageCreator from '../../src/services/cardPackageCreator.js';
import Card from '../../src/models/card.js';
import NodeCache from 'node-cache';
import logger from '../../src/lib/logger.js';
import * as helper from '../../src/lib/helper.js';
import { AppError } from '../../src/lib/errors.js';
import { performance } from 'perf_hooks';

// Access to the caches for flushing/spying
const getPackageCache = () => CardPackageCreator.perform.packageCache; // Expose via a function
const getCardCache = () => CardPackageCreator.getCardPrintQueries.cardCache; // Expose via a function

// Mock NodeCache instances before CardPackageCreator is loaded by the test file if they are module-level
// For this structure, we will mock the instances after they are created inside CardPackageCreator or spy on NodeCache constructor.
// Simpler: spy on NodeCache prototype methods if instances are not directly accessible.

describe('CardPackageCreator Service', function() {
  let mockCardInstance;
  let cardFindRandomStub, cardFindByStub;
  let sanitizeCardNameStub;
  let loggerInfoStub, loggerErrorStub, loggerWarnStub, loggerDebugStub;
  let performanceNowStub;
  let mockPackageCacheGet, mockPackageCacheSet, mockPackageCacheFlush;
  let mockCardCacheGet, mockCardCacheSet, mockCardCacheFlush;

  // Sample data
  const sampleCardList = [{ name: 'Lightning Bolt', count: 4 }, { name: 'Opt', count: 2 }];
  const sampleGames = ['paper', 'mtgo'];
  const sampleDefaultSelection = 'newest';
  const mockBoltPrints = [
    { scryfall_id: 'bolt1', name: 'Lightning Bolt', oracle_id: 'o_bolt', set: 'SET1', released_at: '2020-01-01', prices: { usd: '1.00' } },
    { scryfall_id: 'bolt2', name: 'Lightning Bolt', oracle_id: 'o_bolt', set: 'SET2', released_at: '2022-01-01', prices: { usd: '1.50' } },
  ];
  const mockOptPrints = [
    { scryfall_id: 'opt1', name: 'Opt', oracle_id: 'o_opt', set: 'SET3', released_at: '2021-01-01', prices: { usd: '0.50' } },
  ];

  beforeEach(function() {
    // Mock Card model methods
    cardFindRandomStub = sinon.stub();
    cardFindByStub = sinon.stub();
    // It's usually better to stub methods on an instance if the class creates `new Card()`
    // Or stub Card.prototype methods if CardPackageCreator uses `Card.prototype.method` directly or calls `new Card().method`.
    // For static method calls like `new Card().find_random()`, we need to control what `new Card()` returns.
    const cardInstanceStubs = { find_random: cardFindRandomStub, find_by: cardFindByStub };
    sinon.stub(Card.prototype, 'constructor').returns(cardInstanceStubs); // Mock constructor to return our stubs
    // Or, if Card constructor initializes things, spy it and then stub methods on Card.prototype
    // For this case, CardPackageCreator does `new Card().find_by`, etc.
    // So we can get away with stubbing the prototype if those methods are on the prototype.
    // Let's refine: Card model uses `this.getCollection` which is on prototype, so stubbing Card.prototype methods directly is better
    // if CardPackageCreator doesn't rely on Card constructor logic for these methods.
    // But since `new Card()` is used, we'll ensure methods called on the instance are stubbed.
    // This means we need to control the instance `new Card()` produces.
    // A common pattern: sinon.stub(Card, 'constructor').returns({ find_random: cardFindRandomStub, find_by: cardFindByStub });
    // However, `Card` itself is a class. Let's assume `new Card()` returns an instance whose methods we can stub.
    // This will be tricky if `new Card()` happens many times. Instead, let's stub Card.prototype.
    // cardFindRandomStub = sinon.stub(Card.prototype, 'find_random'); // This applies to all instances
    // cardFindByStub = sinon.stub(Card.prototype, 'find_by');
    // The above would be better. For now, let's assume the original file creates ONE new Card() or we intercept `new Card()`
    // For simplicity, let's assume CardPackageCreator reuses a Card instance or we can control the `new Card()` call.
    // The current code in CardPackageCreator uses `new Card()` multiple times. This requires careful stubbing.
    // The most robust way is to stub the methods on Card.prototype.
    // The most robust way is to stub the methods on Card.prototype.
    cardFindRandomStub = sinon.stub(Card.prototype, 'find_random');
    cardFindByStub = sinon.stub(Card.prototype, 'find_by');


    sanitizeCardNameStub = sinon.stub(helper, 'sanitizeCardName').callsFake(name => `sanitized_${name}`);
    loggerInfoStub = sinon.stub(logger, 'info');
    loggerErrorStub = sinon.stub(logger, 'error');
    loggerWarnStub = sinon.stub(logger, 'warn');
    loggerDebugStub = sinon.stub(logger, 'debug');
    performanceNowStub = sinon.stub(performance, 'now');

    // Mock NodeCache instances
    // We need to mock the *instances* used by CardPackageCreator.
    // One way: access them if they are exported or properties of the class.
    // CardPackageCreator creates them internally. So we mock NodeCache prototype.
    mockPackageCacheGet = sinon.stub(NodeCache.prototype, 'get');
    mockPackageCacheSet = sinon.stub(NodeCache.prototype, 'set');
    mockCardCacheGet = sinon.stub(NodeCache.prototype, 'get'); // This will double-stub if not careful
    mockCardCacheSet = sinon.stub(NodeCache.prototype, 'set');
    // To differentiate, we can make them return different things or check call order/args.
    // Or, ensure CardPackageCreator uses two *distinct* NodeCache instances.
    // The code shows `const cardCache = new NodeCache(...)` and `const packageCache = new NodeCache(...)`
    // This means they are different instances. Sinon stubs prototype, so all instances are affected.
    // We need a way to make them behave differently. Let's assume for now the stubs on prototype work and we can differentiate by call context if needed.
    // A more robust way: if CardPackageCreator exported its cache instances, or took them as params.
    // For now, we'll use the prototype stubs and be careful.
    // Let's use separate stubs for each cache by checking which cache is being interacted with, e.g. via `this` in a fake function
    // Or, rely on call order if tests are simple enough.
    // The current code defines cardCache and packageCache as module-level consts.
    // We'll have to assume `NodeCache.prototype.get` and `set` are general enough.
  });

  afterEach(function() {
    sinon.restore();
    // Manually flush caches if CardPackageCreator doesn't export them for direct flush
    // Or if the NodeCache mock doesn't automatically clear.
    // Accessing them directly is tricky as they are not exported from service.
    // If NodeCache.prototype was stubbed, restore will handle it.
    // For safety, if they were singleton instances, one might do: 
    // CardPackageCreator.cardCache.flushAll(); CardPackageCreator.packageCache.flushAll();
    // But they are not static members. We rely on sinon.restore().
  });

  describe('perform', function() {
    it('should return from packageCache if data is cached', async function() {
      const cachedData = { cardList: [], games: [], default_selection: '', package_entries: [{name: 'Cached Bolt'}] };
      // Make packageCache.get return this data
      // Since NodeCache.prototype.get is stubbed, it will apply to both.
      // We need to ensure it's the *package* cache call.
      // Let's assume the first .get() call in perform() is for packageCache.
      mockPackageCacheGet.onFirstCall().returns(cachedData);

      const result = await CardPackageCreator.perform(sampleCardList, sampleGames, sampleDefaultSelection);
      assert.deepStrictEqual(result, cachedData);
      assert(mockPackageCacheGet.calledOnce);
      assert(loggerInfoStub.notCalled); // No creation logs if cached
    });

    it('should build, cache, and return package if not in packageCache', async function() {
      mockPackageCacheGet.returns(undefined); // package cache miss
      mockCardCacheGet.returns(undefined); // card cache miss for all cards

      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'sanitized_Lightning Bolt' }), Card.SERIALIZED_FIELDS).resolves(mockBoltPrints);
      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'sanitized_Opt' }), Card.SERIALIZED_FIELDS).resolves(mockOptPrints);
      performanceNowStub.onFirstCall().returns(1000); // Start time
      performanceNowStub.onSecondCall().returns(1010); // End time for buildPackageEntries
      performanceNowStub.onThirdCall().returns(1020); // End time for perform

      const result = await CardPackageCreator.perform(sampleCardList, sampleGames, sampleDefaultSelection);
      
      assert(mockPackageCacheGet.calledOnce); // package cache get
      assert(mockCardCacheGet.calledTwice); // card cache get (for Bolt, for Opt)
      assert(cardFindByStub.calledTwice);
      assert(mockPackageCacheSet.calledOnce); // package cache set
      assert(mockCardCacheSet.calledTwice); // card cache set (for Bolt, for Opt)

      assert.strictEqual(result.cardList, sampleCardList);
      assert.strictEqual(result.games, sampleGames);
      assert.strictEqual(result.default_selection, sampleDefaultSelection);
      assert.strictEqual(result.package_entries.length, 2);
      assert.strictEqual(result.package_entries[0].name, 'Lightning Bolt');
      assert.strictEqual(result.package_entries[1].name, 'Opt');
      assert(loggerInfoStub.calledWith(sinon.match(/Package created in .*ms with 2 cards/)));
    });

    it('should handle errors during package creation and re-throw AppError', async function() {
      mockPackageCacheGet.returns(undefined);
      const testError = new Error('Build failed');
      // Make buildPackageEntries (indirectly, getCardPrintQueries or Card.find_by) fail
      cardFindByStub.rejects(testError);

      await assert.rejects(
        CardPackageCreator.perform(sampleCardList, sampleGames, sampleDefaultSelection),
        function(err) {
          assert(err instanceof AppError);
          assert.strictEqual(err.message, 'Failed to create card package: Build failed');
          return true;
        }
      );
      assert(loggerErrorStub.calledWith('Error performing card package creation:', sinon.match.instanceOf(AppError)));
    });
    
    it('should re-throw original AppError if that occurs', async function() {
      mockPackageCacheGet.returns(undefined);
      const originalAppError = new AppError('Specific App Problem', 500);
      cardFindByStub.rejects(originalAppError);

      await assert.rejects(
        CardPackageCreator.perform(sampleCardList, sampleGames, sampleDefaultSelection),
        originalAppError
      );
      assert(loggerErrorStub.calledWith('Error performing card package creation:', originalAppError));
    });
  });

  describe('perform_random', function() {
    const randomListCount = 2;
    const randomGeneratedList = [{ name: 'Random Card 1', count: 1 }, { name: 'Random Card 2', count: 1 }];
    const mockRandomCard1Prints = [{ scryfall_id: 'rc1', name: 'Random Card 1', oracle_id: 'o_rc1', released_at: '2020-01-01' }];
    const mockRandomCard2Prints = [{ scryfall_id: 'rc2', name: 'Random Card 2', oracle_id: 'o_rc2', released_at: '2021-01-01' }];

    it('should fetch random cards, build package, and return data', async function() {
      cardFindRandomStub.withArgs(randomListCount, sampleGames).resolves(randomGeneratedList);
      mockCardCacheGet.returns(undefined); // all card cache misses
      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'sanitized_Random Card 1' })).resolves(mockRandomCard1Prints);
      cardFindByStub.withArgs(sinon.match({ sanitized_name: 'sanitized_Random Card 2' })).resolves(mockRandomCard2Prints);

      const result = await CardPackageCreator.perform_random(randomListCount, sampleGames, sampleDefaultSelection);

      assert(cardFindRandomStub.calledOnceWith(randomListCount, sampleGames));
      assert.deepStrictEqual(result.cardList, randomGeneratedList);
      assert.strictEqual(result.package_entries.length, 2);
      assert.strictEqual(result.package_entries[0].name, 'Random Card 1');
    });
    
    it('should handle error from find_random and wrap in AppError', async function() {
        const findRandomError = new Error('DB down for random');
        cardFindRandomStub.rejects(findRandomError);

        await assert.rejects(
            CardPackageCreator.perform_random(randomListCount, sampleGames, sampleDefaultSelection),
            function(err) {
                assert(err instanceof AppError);
                assert.strictEqual(err.message, 'Failed to create random card package: DB down for random');
                return true;
            }
        );
        assert(loggerErrorStub.calledWith('Error performing random card package creation:', sinon.match.instanceOf(AppError)));
    });
  });

  describe('buildPackageEntries', function() {
    beforeEach(() => {
        // Reset card cache for these specific tests
        mockCardCacheGet.reset();
        mockCardCacheSet.reset();
        cardFindByStub.resetHistory();
    });

    it('should build entries, using card cache and fetching if needed', async function() {
      // Opt is cached, Bolt is not
      mockCardCacheGet.withArgs(sinon.match(/card:sanitized_Opt/)).returns(mockOptPrints); 
      mockCardCacheGet.withArgs(sinon.match(/card:sanitized_Lightning Bolt/)).returns(undefined);
      cardFindByStub.withArgs(sinon.match({sanitized_name: 'sanitized_Lightning Bolt'})).resolves(mockBoltPrints);

      const entries = await CardPackageCreator.buildPackageEntries(sampleCardList, sampleGames, sampleDefaultSelection);
      
      assert.strictEqual(entries.length, 2);
      assert.strictEqual(entries[0].name, 'Lightning Bolt');
      assert.strictEqual(entries[0].card_prints.length, mockBoltPrints.length);
      assert.strictEqual(entries[1].name, 'Opt');
      assert.strictEqual(entries[1].card_prints.length, mockOptPrints.length);
      assert(cardFindByStub.calledOnce); // Only for Bolt
      assert(mockCardCacheSet.calledOnce); // Bolt gets cached
      // Opt was a cache hit, Bolt was a miss then cached
      assert(loggerDebugStub.calledWith(sinon.match('Starting to build package entries for 2 cards')));
      assert(loggerDebugStub.calledWith(sinon.match('Built 2 package entries in')));
    });

    it('should create empty selection if card prints not found and log warning', async function() {
      mockCardCacheGet.returns(undefined);
      cardFindByStub.withArgs(sinon.match({sanitized_name: 'sanitized_Lightning Bolt'})).resolves([]); // No prints for Bolt
      cardFindByStub.withArgs(sinon.match({sanitized_name: 'sanitized_Opt'})).resolves(mockOptPrints);

      const entries = await CardPackageCreator.buildPackageEntries(sampleCardList, sampleGames, sampleDefaultSelection);
      
      assert.strictEqual(entries[0].name, 'Lightning Bolt');
      assert.strictEqual(entries[0].not_found, true);
      assert.strictEqual(entries[0].card_prints.length, 0);
      assert.strictEqual(entries[1].name, 'Opt');
      assert.ok(!entries[1].not_found);
      assert(loggerWarnStub.calledOnceWith('Card not found: Lightning Bolt'));
    });
    
    it('should create empty selection if getCardPrintQueries throws, and log error', async function() {
      mockCardCacheGet.returns(undefined);
      cardFindByStub.withArgs(sinon.match({sanitized_name: 'sanitized_Lightning Bolt'})).rejects(new Error('DB error for Bolt'));
      cardFindByStub.withArgs(sinon.match({sanitized_name: 'sanitized_Opt'})).resolves(mockOptPrints);

      const entries = await CardPackageCreator.buildPackageEntries(sampleCardList, sampleGames, sampleDefaultSelection);
      
      assert.strictEqual(entries[0].name, 'Lightning Bolt');
      assert.strictEqual(entries[0].not_found, true);
      assert(loggerErrorStub.calledWith('Error querying card Lightning Bolt:', sinon.match.instanceOf(Error)));
      assert.strictEqual(entries[1].name, 'Opt');
      assert.ok(!entries[1].not_found);
    });
  });

  describe('getCardPrintQueries', function() {
    const cardName = 'Test Card';
    const cardSanitizedName = 'sanitized_Test Card';
    const cardGames = ['paper'];
    const cardDefaultSelection = 'newest';
    const mockPrints = [{name: cardName, released_at: '2023-01-01', scryfall_id: 's1'}];

    it('should return sorted prints from cardCache if found', async function() {
      const cachedPrints = [...mockPrints, {name: cardName, released_at: '2020-01-01', scryfall_id: 's0'}]; // Unsorted
      mockCardCacheGet.withArgs(`card:${cardSanitizedName}:${cardGames.join(',')}`).returns(cachedPrints);
      const applySortingSpy = sinon.spy(CardPackageCreator, 'applySorting');

      const result = await CardPackageCreator.getCardPrintQueries(cardName, cardGames, cardDefaultSelection);
      
      assert(applySortingSpy.calledOnceWith(cachedPrints, cardDefaultSelection, cardGames));
      assert.strictEqual(result[0].released_at, '2023-01-01'); // Check if 'newest' sorting was applied
      assert(cardFindByStub.notCalled);
      applySortingSpy.restore(); // important to restore spy on static method
    });

    it('should fetch from DB, cache, and return (unsorted by applySorting) prints if not in cache', async function() {
      // Note: The source code for getCardPrintQueries does NOT call applySorting on DB fetch, 
      // it relies on MongoDB sort. applySorting is for cache hits.
      mockCardCacheGet.returns(undefined);
      cardFindByStub.resolves(mockPrints);
      const applySortingSpy = sinon.spy(CardPackageCreator, 'applySorting');

      const result = await CardPackageCreator.getCardPrintQueries(cardName, cardGames, cardDefaultSelection);
      
      assert(sanitizeCardNameStub.calledWith(cardName));
      assert(cardFindByStub.calledOnce);
      assert(mockCardCacheSet.calledOnceWith(`card:${cardSanitizedName}:${cardGames.join(',')}`, mockPrints));
      assert.deepStrictEqual(result, mockPrints);
      assert(applySortingSpy.notCalled); // applySorting is NOT called on DB fetch path in getCardPrintQueries
      applySortingSpy.restore();
    });
  });

  describe('applySorting', function() {
    const p1 = { name: 'Oldest', released_at: '2000-01-01', prices: { usd: '10.00', tix: '5.00'}, scryfall_id: 'p1' };
    const p2 = { name: 'NewestExpensive', released_at: '2023-01-01', prices: { usd: '20.00', tix: '10.00'}, scryfall_id: 'p2' };
    const p3 = { name: 'Mid', released_at: '2010-01-01', prices: { usd: '5.00', tix: '2.00'}, scryfall_id: 'p3' };
    const p4NoPrice = { name: 'NoPrice', released_at: '2005-01-01', prices: {}, scryfall_id: 'p4' }; // Missing price
    const p5NoDate = { name: 'NoDate', prices: { usd: '1.00' }, scryfall_id: 'p5'}; // Missing date
    const prints = [p1, p2, p3, p4NoPrice, p5NoDate];

    it('should return prints if list is null, empty, or has one element', function() {
      assert.deepStrictEqual(CardPackageCreator.applySorting(null, 'newest', ['paper']), null);
      assert.deepStrictEqual(CardPackageCreator.applySorting([], 'newest', ['paper']), []);
      assert.deepStrictEqual(CardPackageCreator.applySorting([p1], 'newest', ['paper']), [p1]);
    });

    it('sorts by newest (default)', function() {
      const sorted = CardPackageCreator.applySorting([...prints], 'newest', ['paper']);
      assert.deepStrictEqual(sorted.map(p=>p.name), ['NewestExpensive', 'Mid', 'NoPrice', 'Oldest', 'NoDate']);
    });

    it('sorts by oldest', function() {
      const sorted = CardPackageCreator.applySorting([...prints], 'oldest', ['paper']);
      assert.deepStrictEqual(sorted.map(p=>p.name), ['NoDate', 'Oldest', 'NoPrice', 'Mid', 'NewestExpensive']);
    });

    it('sorts by most_expensive (usd for paper)', function() {
      const sorted = CardPackageCreator.applySorting([...prints], 'most_expensive', ['paper', 'mtgo']);
      assert.deepStrictEqual(sorted.map(p=>p.name), ['NewestExpensive', 'Oldest', 'Mid', 'NoDate', 'NoPrice']);
    });

    it('sorts by most_expensive (tix for mtgo only)', function() {
      const sorted = CardPackageCreator.applySorting([...prints], 'most_expensive', ['mtgo']);
      assert.deepStrictEqual(sorted.map(p=>p.name), ['NewestExpensive', 'Oldest', 'Mid', 'NoDate', 'NoPrice']);
    });

    it('sorts by least_expensive (usd for paper)', function() {
      const sorted = CardPackageCreator.applySorting([...prints], 'least_expensive', ['paper']);
      assert.deepStrictEqual(sorted.map(p=>p.name), ['NoPrice','NoDate', 'Mid', 'Oldest', 'NewestExpensive']);
    });
    
    it('sorts by least_expensive (tix for mtgo only)', function() {
        const sorted = CardPackageCreator.applySorting([...prints], 'least_expensive', ['mtgo']);
        assert.deepStrictEqual(sorted.map(p=>p.name), ['NoPrice', 'NoDate', 'Mid', 'Oldest', 'NewestExpensive']);
    });
  });

  describe('buildQueryForCardPrints', function() {
    const entry = { name: 'Test Query Card' };
    it('builds query for newest (default)', function() {
      const query = CardPackageCreator.buildQueryForCardPrints(entry, ['paper'], 'newest');
      assert.deepStrictEqual(query.sort, { released_at: -1 });
      assert.strictEqual(query.sanitized_name, 'sanitized_Test Query Card');
      assert.deepStrictEqual(query.games, { $in: ['paper'] });
    });
    // ... other selection types ...
    it('builds query for most_expensive (usd for paper)', function() {
      const query = CardPackageCreator.buildQueryForCardPrints(entry, ['paper', 'mtgo'], 'most_expensive');
      assert.deepStrictEqual(query.sort, { 'prices.usd': -1 });
    });
    it('builds query for most_expensive (tix for mtgo only)', function() {
      const query = CardPackageCreator.buildQueryForCardPrints(entry, ['mtgo'], 'most_expensive');
      assert.deepStrictEqual(query.sort, { 'prices.tix': -1 });
    });
  });

  describe('generatePackageCacheKey', function() {
    it('generates a consistent cache key', function() {
      const key1 = CardPackageCreator.generatePackageCacheKey(sampleCardList, ['paper', 'mtgo'], 'newest');
      const key2 = CardPackageCreator.generatePackageCacheKey(sampleCardList, ['mtgo', 'paper'], 'newest'); // different game order
      const key3 = CardPackageCreator.generatePackageCacheKey(sampleCardList, ['paper', 'mtgo'], 'oldest'); // different selection
      assert.strictEqual(key1, key2); // Games are sorted
      assert.notStrictEqual(key1, key3);
      const expectedStart = `package:${JSON.stringify(sampleCardList)}:mtgo,paper:newest`; // games sorted
      assert.strictEqual(key1, expectedStart, `Expected ${expectedStart}, but got ${key1}`);
    });
  });

  describe('buildCardSelections', function() {
    it('should build card selection from prints', function() {
      const selection = CardPackageCreator.buildCardSelections(mockBoltPrints, 3);
      assert.strictEqual(selection.count, 3);
      assert.strictEqual(selection.name, 'Lightning Bolt');
      assert.strictEqual(selection.oracle_id, 'o_bolt');
      assert.deepStrictEqual(selection.card_prints, mockBoltPrints);
      assert.strictEqual(selection.selected_print, mockBoltPrints[0].scryfall_id);
      assert.strictEqual(selection.user_selected, false);
    });
  });

  describe('buildEmptyCardSelection', function() {
    it('should build an empty card selection for a not found card', function() {
      const entry = { name: 'Missing Card', count: 1 };
      const selection = CardPackageCreator.buildEmptyCardSelection(entry);
      assert.strictEqual(selection.count, 1);
      assert.strictEqual(selection.name, 'Missing Card');
      assert.strictEqual(selection.oracle_id, null);
      assert.deepStrictEqual(selection.card_prints, []);
      assert.strictEqual(selection.selected_print, null);
      assert.strictEqual(selection.user_selected, false);
      assert.strictEqual(selection.not_found, true);
    });
  });
});