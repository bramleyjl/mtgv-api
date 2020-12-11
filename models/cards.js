const axios = require('axios');
const mongo = require('../helpers/mongo');
const tcgPlayer = require('./tcgplayer');

module.exports = {
  getCardNameCount: function (input) {
    var cardCount = input.match(/\d+\s*/);
    if (cardCount === null) {
      cardCount = 1;
    } else {
      cardCount = Number(cardCount[0]);
    }
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
  getVersionsArray: function (card, token) {
    return axios.get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
    .then(response => {
      return getCardVersions(response.data.name);
    })
    .then(response => {
      return createVersionsArray(response, token);
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
  prepareImagesArray: function (imageLookups, cardNameCounts) {
    let imagesArray = new Array();
    let i = 0;
    for (card of cardNameCounts) {
      var cardVersions = imageLookups[i];
      var primaryValues = Object.values(cardVersions)[0];
      var displayObj = {};
      displayObj['displayName'] = primaryValues.displayName;
      displayObj["name"] = primaryValues.name;
      displayObj["cardFound"] = primaryValues.version === "" ? false : true;
      displayObj["versions"] = imageLookups[i];
      displayObj["count"] = card.count;
      displayObj["selected"] = false;
      displayObj["selectedVersion"] = Object.keys(cardVersions)[0];
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

function createVersionsArray(editions, bearerToken) {
  let editionImages = [];
  let tcgPromises = [];
  editions.forEach(edition => {
    if (edition.tcgplayer_id !== undefined) {
      var tcgHeaders = {
        Authorization: `bearer ${bearerToken}`,
        getExtendedFields: "true",
      };
      tcgPromises.push(axios.get(`http://api.tcgplayer.com/pricing/product/${edition.tcgplayer_id}`, { headers: tcgHeaders }));
    }
    if (edition["layout"] === "transform") {
      var cardName = [edition.card_faces[0].name, edition.card_faces[1].name];
      var cardImage = [edition.card_faces[0].image_uris.small, edition.card_faces[1].image_uris.small];
      var displayName = cardName[0] + " // " + cardName[1];
    } else {
      var cardName = [edition.name];
      var cardImage = [edition.image_uris.small];
      var displayName = cardName[0];
    }
    editionImages.push({
      id: edition.id,
      name: cardName,
      displayName: displayName,
      version: nameShorten(edition.set_name),
      image: cardImage,
      releasedAt: edition.released_at,
      tcgId: edition.tcgplayer_id,
      tcgPurchase: `https://shop.tcgplayer.com/product/productsearch?id=${edition.tcgplayer_id}`,
    });
  });
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
