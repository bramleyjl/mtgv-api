const axios = require('axios');
const mongo = require('../helpers/mongo');
const helper = require('../helpers/helper');

module.exports = {
  getCardNameCount: function (input) {
    let cardCount = input.match(/\d+\s*/);
    cardCount = (cardCount === null) ? 1 : Number(cardCount[0]);
    const cardName = input.replace(/\d+\s*/, "").replace(/\'/gi, "");
    cardNameCount = {
      name: cardName,
      count: cardCount,
    };
    return cardNameCount;
  },
  getRandomCard: function () {
    return axios.get(`https://api.scryfall.com/cards/random`)
    .then(response => {
      response = `${response.data.name}`;
      const landList = ["Mountain", "Island", "Plains", "Swamp", "Forest"];
      if (landList.indexOf(response) != -1) {
        console.log(
          "Basic land %s found. Requesting new random card.",
          response
        );
        response = this.getRandomCard();
      }
      return response;
    });
  },
  getTextList: function(cards, format = 'arena') {
    let list = '';
    for (let card of cards) {
      let listEntry = '';
      let selectedVersion = card.versions[card.selectedVersion];
      let setCode = selectedVersion.set.toUpperCase();
      let collectorNumber = selectedVersion.collectorNumber;
      if (format === 'tcgApi') {
        listEntry = `${card.count} ${card.displayName} [${setCode}]||`;
      } else {
        listEntry = `${card.count} ${card.displayName} (${setCode}) ${collectorNumber}`;
      }
      if (format === 'arena' && list.length > 0) {
        list += "\n";
      }
      list += listEntry;
    }
    return list;
  },
  getVersionsArray: function (card) {
    return axios.get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
    .then(response => {
      return lookupCardVersions(response.data.name);
    })
    .then(response => {
      let editionImages = [];
      response.forEach(edition => {
        editionImages.push(buildEditionObject(edition));
      });
      return editionImages;
    })
    .catch(error => {
      console.log(error);
      if (error.response.status == 400 || error.response.status == 404) {
        var noCard = {};
        noCard[0] = {
          name: [card],
          version: "",
          image: [
            "https://c1.scryfall.com/file/scryfall-cards/small/front/e/c/ec8e4142-7c46-4d2f-aaa6-6410f323d9f0.jpg?1561851198",
          ],
        };
        return noCard;
      } else {
        console.log(error);
      }
    });
  },
  prepareVersionSelectList: function (cardNameCounts, imageLookups) {
    let imagesArray = [];
    let i = 0;
    for (card of cardNameCounts) {
      let cardVersions = imageLookups[i];
      let primaryValues = Object.values(cardVersions)[0];
      let displayObj = {
        displayName: primaryValues.displayName,
        name: primaryValues.name,
        cardFound: primaryValues.version === "" ? false : true,
        versions: imageLookups[i],
        count: card.count,
        selected: false,
        selectedVersion: Object.keys(cardVersions)[0]
      };
      imagesArray[i] = displayObj;
      i++;
    }
    return imagesArray;
  },
};

function buildEditionObject(edition) {
  let cardName, cardImage, displayName;
  if (edition["layout"] === "transform" || edition['layout'] === 'modal_dfc') {
    cardName = [edition.card_faces[0].name, edition.card_faces[1].name];
    cardImage = [edition.card_faces[0].image_uris.small, edition.card_faces[1].image_uris.small];
    displayName = cardName[0] + " // " + cardName[1];
  } else {
    cardName = [edition.name];
    cardImage = [edition.image_uris.small];
    displayName = cardName[0];
  }
  return {
    id: edition.id,
    name: cardName,
    displayName: displayName,
    set: edition.set,
    collectorNumber: edition.collector_number,
    version: helper.nameShorten(edition.set_name),
    image: cardImage,
    releasedAt: edition.released_at,
    tcgId: edition.tcgplayer_id,
    tcgPurchase: `https://shop.tcgplayer.com/product/productsearch?id=${edition.tcgplayer_id}`,
    prices: edition.prices
  };
}

function lookupCardVersions(cardName) {
  return mongo.connect()
  .then(dbo => {
    return dbo.db().collection(process.env.BULK_DATA_COLLECTION).find({
      name: cardName,
      digital: false
    }).toArray()
    .then(docs => {
      dbo.close();
      return docs;
    });
  });
}
