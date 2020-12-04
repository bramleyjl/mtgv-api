const axios = require('axios');
const mongo = require('../helpers/mongo');
const tcgPlayer = require('./tcgplayer')

module.exports = {
  getCardNameCount: function (input) {
    var cardCount = input.match(/\d+\s*/);
    cardCount = (cardCount === null) ? 1 : cardCount;
    var cardName = input.replace(/\d+\s*/, "").replace(/\'/gi, "");
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
  getVersionsObject: function (card, token) {
    return axios.get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
    .then(response => {
      let cardName = response.data.name;
      return getCardVersions(cardName);
    })
    .then(response => {        
      return createVersionsObject(response, token);
    })
    .catch(error => {
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
  prepareImagesArray: function (imageLookups, cardNames) {
    let imagesArray = new Array();
    let i = 0;
    for (card of cardNames) {
      var cardVersions = imageLookups[i];
      var primaryValues = Object.values(cardVersions)[0];
      var displayObj = {};
      displayObj["name"] = primaryValues.name;
      displayObj["cardFound"] = primaryValues.version === "" ? false : true;
      displayObj["versions"] = imageLookups[i];
      displayObj["count"] = card.count;
      imagesArray[i] = displayObj;
      i++;
    }
    return imagesArray;
  },
};

function getCardVersions(cardName) {
  return mongo.connect()
  .then(dbo => {
    return dbo.db().collection(process.env.BULK_DATA_COLLECTION)
    .find({name: cardName, digital: false})
    .toArray()
      .then(docs => {
        dbo.close();
        return docs;
      });
  });
}

function createVersionsObject(editions, bearerToken) {
  let editionImages = {};
  let tcgPromises = [];
  editions.forEach(edition => {
    if (edition.tcgplayer_id !== undefined) {
      var tcgHeaders = {
        Authorization: `bearer ${bearerToken}`,
        getExtendedFields: "true",
      };
      tcgPromises.push(axios.get(`http://api.tcgplayer.com/v1.32.0/pricing/product/${edition.tcgplayer_id}`, { headers: tcgHeaders }));
    }
    if (edition["layout"] === "transform") {
      var cardName = [edition.card_faces[0].name, edition.card_faces[1].name];
      var cardImage = [edition.card_faces[0].image_uris.small, edition.card_faces[1].image_uris.small];
    } else {
      var cardName = [edition.name];
      var cardImage = [edition.image_uris.small];
    }
    editionImages[edition.id] = {
      name: cardName,
      version: nameShorten(edition.set_name),
      image: cardImage,
      releasedAt: edition.released_at,
      tcgId: edition.tcgplayer_id,
      tcgPurchase: `https://shop.tcgplayer.com/product/productsearch?id=${edition.tcgplayer_id}`,
    };
  })
  return Promise.all(tcgPromises)
  .then(results => {
    return tcgPlayer.addTcgPrices(editionImages, results);
  })
  .catch(error => {
    console.log(error);
  });
}

function nameShorten(cardName) {
  const shortNames = [
    [/^Duel Decks:/, "DD:"],
    [/^Duel Decks Anthology:/, "DDA:"],
    [/^Duels of the Planeswalkers/, "DotP"],
    [/^Friday Night Magic/, "FNM"],
    [/^Magic Online/, "MTGO"],
    [/^Magic Player Rewards/, "MPR"],
    [/^Premium Deck Series:/, "PDS"],
    [/^Pro Tour/, "PT"],
    [/^Wizards Play Network/, "WPN"],
  ];
  shortNames.forEach(function (name) {
    cardName = cardName.replace(name[0], name[1]);
  });
  return cardName;
}
