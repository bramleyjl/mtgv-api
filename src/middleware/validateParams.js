import { ValidationError } from '../lib/errors.js';

const DEFAULT_SELECTION_OPTIONS = ['oldest', 'newest', 'most_expensive', 'least_expensive'];
const EXPORT_TYPES = ['tcgplayer', 'text'];
const GAME_TYPES = ['paper', 'mtgo', 'arena'];

export function validateGameTypes(req, res, next) {
 try {
  const games = req.query.games;
  req.validatedGames = validateGameTypesData(games);
  next();
 } catch (error) {
  next(new ValidationError(error.message, { provided: req.query.games }));
 }
}

export function validateCardList(req, res, next) {
  try {
    const cardList = req.body.card_list;
    req.validatedCardList = validateCardListData(cardList);
    next();
  } catch (error) {
    next(new ValidationError(error.message, { provided: req.body.card_list }));
  }
}

export function validateCardCount(req, res, next) {
  try{
    const count = parseInt(req.query.count, 10);
    if (isNaN(count) || count <= 0) {
      throw new Error('Count must be a positive integer');
    }
    req.validatedCount = count;
    next();
  } catch (error) {
    next(new ValidationError(error.message, { provided: req.query.count }));
  }
}

export function validateDefaultSelection(req, res, next) {
  try {
    const defaultSelection = req.query.defaultSelection;
    if (!defaultSelection) {
      req.validatedDefaultSelection = 'newest';
    } else if (!DEFAULT_SELECTION_OPTIONS.includes(defaultSelection)) {
      throw new Error('Invalid "defaultSelection" provided.');
    } else {
      req.validatedDefaultSelection = defaultSelection;
    }
    next();
  } catch (error) {
    next(new ValidationError(error.message, {
      allowed: DEFAULT_SELECTION_OPTIONS,
      provided: req.query.defaultSelection
    }));
  }
}

export function validateExportType(req, res, next) {
  try {
    const type = req.query.type
    if (!type) {
      req.validatedExportType = 'text';
    } else if (!EXPORT_TYPES.includes(type)) {
      throw new Error('Invalid export type.');
    } else {
      req.validatedExportType = type;
    }
    next();
  } catch (error) {
    next(new ValidationError(error.message, { 
      allowed: EXPORT_TYPES,
      provided: req.query.type 
    }));
  }
}

export function validateSelectedPrints(req, res, next) {
  try {
    const selectedPrints = req.body.selected_prints;
    req.validatedSelectedPrints = validateSelectedPrintsData(selectedPrints);
    next();
  } catch (error) {
    next(new ValidationError(error.message, { provided: req.body.selected_prints }));
  }
}

export function validateSearchQuery(req, res, next) {
  try {
    const query = req.query.query;
    req.validatedQuery = validateSearchQueryData(query);
    next();
  } catch (error) {
    next(new ValidationError(error.message, { provided: req.query.query }));
  }
}

function validateCardListData(cardList) {
  if (!Array.isArray(cardList) || cardList.length === 0) {
    throw new Error('"card_list" must be a non-empty array.');
  }
  
  let totalCount = 0;
  for (const card of cardList) {
    if (typeof card.name !== 'string' || card.name.trim() === '') {
      throw new Error(`Every card in "card_list" must have a valid, non-empty name. Provided: ${card.name}`);
    }
    if (!/[a-zA-Z]/.test(card.name.trim())) {
      throw new Error(`Every card in "card_list" must have at least one letter in its name. Provided: ${card.name}`);
    }
    if (typeof card.count !== 'number' || card.count <= 0) {
      throw new Error(`Every card in "card_list" must have a valid positive count. Provided: ${card.count}`);
    }
    totalCount += 1;
  }
  if (totalCount > 100) {
    throw new Error(`Total cards (${totalCount}) exceeds the limit of 100 cards.`);
  }
  
  // Return validated data without modification
  return cardList.map(card => ({
    ...card,
    name: card.name.trim()
  }));
}

function validateGameTypesData(games) {
  const gamesArray = games ? (Array.isArray(games) ? games : [games]) : [];
  if (gamesArray.length === 0) {
    return ['paper'];
  } else {
    const validatedGames = gamesArray.filter(type => GAME_TYPES.includes(type));
    if (gamesArray.length > 0 && validatedGames.length === 0) {
      throw new Error('Invalid "game" provided.');
    }
    return validatedGames;
  }
}

function validateSelectedPrintsData(selectedPrints) {
  if (!Array.isArray(selectedPrints) || selectedPrints.length === 0) {
    throw new Error('"selected_prints" must be a non-empty array.');
  }
  
  for (const print of selectedPrints) {
    if (typeof print.scryfall_id !== 'string' || print.scryfall_id.trim() === '') {
      throw new Error(`Every print in "selected_prints" must have a valid, non-empty scryfall_id. Provided: ${print.scryfall_id}`);
    }
    if (typeof print.count !== 'number' || print.count <= 0) {
      throw new Error(`Every print in "selected_prints" must have a valid positive count. Provided: ${print.count}`);
    }
  }
  
  return selectedPrints;
}

function validateSearchQueryData(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new Error('"query" must be a non-empty string.');
  }
  
  if (query.trim().length < 2) {
    throw new Error('"query" must be at least 2 characters long.');
  }
  
  return query.trim();
}
