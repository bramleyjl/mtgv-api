import Card from '../models/card.js';
import logger from '../lib/logger.js';
import { sanitizeCardName } from '../lib/helper.js';

export default {
  searchCards: async function (req, res, next) {
    try {
      const query = req.validatedQuery;
      const uniqueNameOnly = req.query.unique_names_only !== 'false';
      const sanitizedQuery = sanitizeCardName(query);
      
      const cardModel = new Card();
      const cards = await cardModel.searchByName(sanitizedQuery, uniqueNameOnly);
      
      res.json({
        cards,
        total: cards.length,
        query: query,
        sanitized_query: sanitizedQuery,
        unique_names_only: uniqueNameOnly
      });
    } catch (err) {
      logger.error('Error in searchCards:', err);
      next(err);
    }
  }
}; 