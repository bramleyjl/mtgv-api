module.exports = {
 nameShorten: function(cardName) {
    const shortNames = [
      [/^Classic Sixth Edition/, "Sixth Edition"],
      [/^Duel Decks:/, "DD:"],
      [/^Duel Decks Anthology:/, "DDA:"],
      [/^Duels of the Planeswalkers/, "DotP"],
      [/^Friday Night Magic/, "FNM"],
      [/^Limited Edition /, ""],
      [/^Magic Online/, "MTGO"],
      [/^Magic Player Rewards/, "MPR"],
      [/^Premium Deck Series:/, "PDS"],
      [/^Pro Tour/, "PT"],
      [/ Tokens/, ""],
      [/^Wizards Play Network/, "WPN"],
      [/^World Championship/, "WC"],
    ];
    shortNames.forEach(function (name) {
      cardName = cardName.replace(name[0], name[1]);
    });
    return cardName;
  },
  sanitizeCardName: function(cardName) {
    return cardName.replace(/[^a-zA-Z0-9_ ]/g, "").replace(/\s+/g, '_').toLowerCase();
  }
}