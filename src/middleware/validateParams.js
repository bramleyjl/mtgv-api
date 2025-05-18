const GAME_TYPES = ['paper', 'mtgo', 'arena'];

export function validateGameTypes(req, res, next) {
  const gamesArray = req.query.games ? (Array.isArray(req.query.games) ? req.query.games : [req.query.games]) : [];
  if (gamesArray.length === 0) {
    req.validatedGames = GAME_TYPES;
  } else {
    const validatedGames = gamesArray.filter(type => GAME_TYPES.includes(type));
    if (gamesArray.length > 0 && validatedGames.length === 0) {
      return res.status(400).json({
        error: 'Invalid game type provided.',
        allowed: GAME_TYPES,
        provided: gamesArray
      });
    }
    req.validatedGames = validatedGames;
  }

  next();
}

export function validateCardList(req, res, next) {
  const cardList = req.body.card_list;
  if (!Array.isArray(cardList) || cardList.length === 0) {
    return res.status(400).json({ error: 'card_list must be a non-empty array.' });
  }
  for (const card of cardList) {
    if (typeof card.name !== 'string' || card.name.trim() === '') {
      return res.status(400).json({ error: 'Every card in card_list must have a valid, non-empty name.' });
    }
    if (typeof card.count !== 'number' || card.count <= 0) {
      return res.status(400).json({ error: 'Every card in card_list must have a valid positive count.' });
    }
  }
  req.validatedCardList = cardList;

  next();
}