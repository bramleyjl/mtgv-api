export const sortVersions = (cardImages, sortMethod) => {
  cardImages.forEach(card => {
    if (card.cardFound === false) return;
    let sorted = [];
    switch (sortMethod) {
      case 'priceLow':
        sorted = card.versions.sort(priceSort);
        break;
      case 'versionName':
      default:
        sorted = card.versions.sort(nameSort);
        break;
    }
    card.versions = sorted;
  });
  return cardImages;
};

function nameSort(a, b) {
  const aName = a.version.toLowerCase();
  const bName = b.version.toLowerCase();
  if (aName < bName) {
    return -1;
  } else if (bName < aName) {
    return 1;
  }
  return 0;
}

function priceSort(a, b) {
  const aPrice = getLowestPrice(a);
  const bPrice = getLowestPrice(b);
  if (!aPrice) { return b; }
  if (!bPrice) { return a; }
  return getLowestPrice(a) - getLowestPrice(b);
}

function getLowestPrice(version) {
  let prices = [version.prices['usd'], version.prices['usd_foil']].filter(val =>{
    return val !== null;
  });
  return Math.min(...prices);
}