import Card from '../models/card.js';
import logger from '../lib/logger.js';
import { sanitizeCardName } from '../lib/helper.js';

export default {
  searchCards: async function (req, res, next) {
    try {
      const query = req.validatedQuery;
      const unique = req.query.unique !== 'false';
      const sanitizedQuery = sanitizeCardName(query);
      
      const cardModel = new Card();
      const cards = await cardModel.searchByName(sanitizedQuery, unique);
      
      res.json({
        cards,
        total: cards.length,
        query: query,
        sanitized_query: sanitizedQuery,
        unique_names_only: unique
      });
    } catch (err) {
      logger.error('Error in searchCards:', err);
      next(err);
    }
  }
}; 