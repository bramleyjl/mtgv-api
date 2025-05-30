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

export function validateCardPackage(req, res, next) {
  try {
    const cardPackage = req.body.card_package;
    
    if (!cardPackage) {
      throw new Error('"card_package" is required in the request body');
    }
    
    const requiredFields = ['cardList', 'games', 'default_selection', 'package_entries'];
    for (const field of requiredFields) {
      if (!cardPackage[field]) {
        throw new Error(`"card_package" is missing required field: ${field}`);
      }
    }

    validateCardListData(cardPackage.cardList);
    validateGameTypesData(cardPackage.games);
    
    if (!Array.isArray(cardPackage.package_entries) || cardPackage.package_entries.length === 0) {
      throw new Error('package_entries must be a non-empty array');
    }
    
    for (const entry of cardPackage.package_entries) {
      if (!entry.name || !entry.count || !entry.card_prints || !entry.selected_print) {
        throw new Error('Each package_entries entry must have name, count, card_prints, and selected_print');
      }
    }

    req.validatedCardPackage = cardPackage;
    next();
  } catch (error) {
    next(new ValidationError(error.message, { 
      provided: req.body.card_package 
    }));
  }
}

function validateCardListData(cardList) {
  if (!Array.isArray(cardList) || cardList.length === 0) {
    throw new Error('"card_list" must be a non-empty array.');
  }
  
  for (const card of cardList) {
    if (typeof card.name !== 'string' || card.name.trim() === '') {
      throw new Error(`Every card in "card_list" must have a valid, non-empty name. Provided: ${card.name}`);
    }
    if (typeof card.count !== 'number' || card.count <= 0) {
      throw new Error(`Every card in "card_list" must have a valid positive count. Provided: ${card.count}`);
    }
  }
  
  return cardList;
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
