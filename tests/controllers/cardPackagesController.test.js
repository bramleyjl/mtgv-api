import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import database from "../../src/db/database.js";

import CardPackageCreator from '../../src/services/cardPackageCreator.js';
import CardPackageExporter from '../../src/services/cardPackageExporter.js';

// mock services
CardPackageCreator.perform = jest.fn();
CardPackageCreator.perform_random = jest.fn();
CardPackageExporter.exportTCGPlayer = jest.fn();
CardPackageExporter.exportText = jest.fn();

// Import the fixtures
import validCardPackage from '../fixtures/cardPackages/validCardPackage.json';
import randomCardPackage from '../fixtures/cardPackages/randomCardPackage.json';
import textExport from '../fixtures/cardPackages/textExport.json';
import tcgPlayerExport from '../fixtures/cardPackages/tcgPlayerExport.json';

const validCardList = validCardPackage.card_list;
const randomCardList = randomCardPackage.card_list;

describe('Card Packages Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await database.close();
  });

  describe('POST /card_package', () => {
    it('should create a card package successfully', async () => {
      const expectedFirstCard = validCardList[0];
      const expectedSecondCard = validCardList[1];

      CardPackageCreator.perform.mockResolvedValue(validCardPackage);

      const response = await request(app)
        .post('/card_package')
        .query({
          game: validCardPackage.game,
          defaultSelection: validCardPackage.default_selection
        })
        .send({
          card_list: validCardList
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('card_package');
      expect(CardPackageCreator.perform).toHaveBeenCalledWith(
        [
          {
            name: "terror",
            count: 1
          },
          {
            name: "natural order",
            count: 4
          }
        ],
        'paper',
        'most_expensive'
      );

      expect(response.body.card_package.card_list).toContainEqual(expectedFirstCard);
      expect(response.body.card_package.card_list).toContainEqual(expectedSecondCard);
      expect(response.body.card_package.default_selection).toBe("most_expensive");
    });

    it('should return 400 for invalid card list', async () => {
      const response = await request(app)
        .post('/card_package')
        .send({
          card_list: [],
          game: 'paper',
          defaultSelection: 'newest'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /card_package/random', () => {
    it('should create a random card package successfully', async () => {
      const expectedFirstCard = randomCardList[0];
      const expectedSecondCard = randomCardList[1];

      CardPackageCreator.perform_random.mockResolvedValue(randomCardPackage);

      const response = await request(app)
        .get('/card_package/random')
        .query({
          count: 3,
          game: randomCardPackage.game,
          defaultSelection: randomCardPackage.default_selection
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('card_package');
      expect(CardPackageCreator.perform_random).toHaveBeenCalledWith(
        3,
        'paper',
        'newest'
      );

      expect(response.body.card_package.card_list).toContainEqual(expectedFirstCard);
      expect(response.body.card_package.card_list).toContainEqual(expectedSecondCard);
      expect(response.body.card_package.default_selection).toBe("newest");
    });

    it('should return 400 for invalid count', async () => {
      const response = await request(app)
        .get('/card_package/random')
        .query({
          count: -1,
          game: 'paper',
          defaultSelection: 'newest'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid game type', async () => {
      const response = await request(app)
        .get('/card_package/random')
        .query({
          count: 10,
          game: 'invalid_game',
          defaultSelection: 'newest'
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid selection criteria', async () => {
      const response = await request(app)
        .get('/card_package/random')
        .query({
          count: 10,
          game: 'paper',
          defaultSelection: 'invalid_default_selection'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /card_package/export', () => {
    it('should export to TCGPlayer format', async () => {
      CardPackageExporter.exportTCGPlayer.mockReturnValue(tcgPlayerExport.export_text);

      const response = await request(app)
        .post('/card_package/export')
        .query({ type: 'tcgplayer' })
        .send({ 
          selected_prints: validCardPackage.package_entries.map(entry => ({
            count: entry.count,
            scryfall_id: entry.selected_print
          }))
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('export_text', tcgPlayerExport.export_text);
      expect(response.body).toHaveProperty('type', 'tcgplayer');
      expect(CardPackageExporter.exportTCGPlayer).toHaveBeenCalledWith(
        validCardPackage.package_entries.map(entry => ({
          count: entry.count,
          scryfall_id: entry.selected_print
        }))
      );
    });

    it('should export to text format', async () => {
      CardPackageExporter.exportText.mockReturnValue(textExport.export_text);

      const response = await request(app)
        .post('/card_package/export')
        .query({ type: 'text' })
        .send({ 
          selected_prints: validCardPackage.package_entries.map(entry => ({
            count: entry.count,
            scryfall_id: entry.selected_print
          }))
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('export_text', textExport.export_text);
      expect(response.body).toHaveProperty('type', 'text');
      expect(CardPackageExporter.exportText).toHaveBeenCalledWith(
        validCardPackage.package_entries.map(entry => ({
          count: entry.count,
          scryfall_id: entry.selected_print
        }))
      );
    });

    it('should return 400 for invalid export type', async () => {
      const response = await request(app)
        .post('/card_package/export')
        .query({ type: 'invalid_type' })
        .send({ 
          selected_prints: validCardPackage.package_entries.map(entry => ({
            count: entry.count,
            scryfall_id: entry.selected_print
          }))
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing selected prints', async () => {
      const response = await request(app)
        .post('/card_package/export')
        .query({ type: 'text' })
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid selected prints structure', async () => {
      const response = await request(app)
        .post('/card_package/export')
        .query({ type: 'text' })
        .send({ 
          selected_prints: [
            {
              // Missing required fields
              count: 1
            }
          ]
        });

      expect(response.status).toBe(400);
    });
  });
});