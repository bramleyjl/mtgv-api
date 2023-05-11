export const validateCardList = (cardList) => {
  const basics = ['plains', 'island', 'swamp', 'mountain', 'forest'];
  var parsedCards = cardList.split("\n").map(card => {
    var cardObj = getCardNameCount(card);
    if (basics.some(land => cardObj['name'].includes(land))) { return }
    return cardObj;
  })
  parsedCards = parsedCards.filter(obj => obj);
  if (parsedCards.length > 100) { 
    throw Error(`Decklists of over 100 entries are not supported, your list contains ${parsedCards.length} entries excluding basic lands.`);
  }
  return parsedCards;
}

function getCardNameCount(card) {
  var cardCount = card.match(/\d+\s*/);
  cardCount = (cardCount === null) ? 1 : Number(cardCount[0]);
  const cardName = card.replace(/\d+\s*/, "").replace(/\'/gi, "").toLowerCase();
  return { name: cardName, count: cardCount };
}