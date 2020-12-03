const axios = require("axios");
const fs = require("fs");
const mongo = require("../helpers/mongo");
const PDFDocument = require("pdfkit");

module.exports = {
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
  //searches for selected card and returns all version images
  imageLookup: function (card, token) {
    return axios.get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
    .then(response => {
      // const allEditions = response.data.prints_search_uri;
      let cardName = response.data.name;
      return getCardEditions(cardName);
      // return axios.get(allEditions);
    })
    .then(response => {        
      return createEditionObject(response, token);
    })
    .then(response => {
      //sort editions alphabetically
      const orderedEditionImages = {};
      Object.keys(response)
        .sort()
        .forEach(function (key) {
          orderedEditionImages[key] = response[key];
        });
      return orderedEditionImages;
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
  //builds PDF
  buildPDF: function (versionObj) {
    var doc = new PDFDocument();
    var fileName = Date.now();
    var filePath = "./assets/pdfs/" + fileName + ".pdf";
    let imageCounts = {};
    let imagePromises = [];
    doc.pipe(fs.createWriteStream(filePath));
    versionObj.forEach(function (obj) {
      var countKey = getCountKey(obj.image);
      imageCounts[countKey] = Number(obj.count);
      imagePromises.push(axios.get(obj.image, { responseType: "arraybuffer" }));
    });
    return Promise.all(imagePromises)
    .then(result => {
      var cardPosition = 1;
      var cardCount = 1;
      var totalCards = Object.values(imageCounts).reduce((a, b) => a + b, 0);
      for (var card of result) {
        var image = Buffer.from(card.data, "base64");
        var countKey = getCountKey(card.config.url);
        for (var copies = imageCounts[countKey]; copies > 0; copies--) {
          var width = calcPictureWidth(cardPosition);
          var height = calcPictureHeight(cardPosition);
          doc.image(image, width, height, { width: 180, height: 252 });
          if (cardPosition === 9 && cardCount != totalCards) {
            doc.addPage();
            cardPosition = 1;
          } else {
            cardCount += 1;
            cardPosition += 1;
          }
        }
      }
      doc.end();
      return fileName;
    });
  },
  prepareCardObjects: function (imageLookups, cardNames) {
    let cardObjects = new Array();
    let i = 0;
    for (card of cardNames) {
      var cardVersions = imageLookups[i];
      var primaryValues = Object.values(cardVersions)[0];
      var displayObj = {};
      displayObj["name"] = primaryValues.name;
      displayObj["cardFound"] = primaryValues.version === "" ? false : true;
      displayObj["versions"] = imageLookups[i];
      displayObj["count"] = card.count;
      cardObjects[i] = displayObj;
      i++;
    }
    return cardObjects;
  },
};

function getCountKey(url) {
  let keyRegEx = /(?<=\?)\d+/;
  return keyRegEx.exec(url)[0];
}

function calcPictureWidth(count) {
  if (count % 3 === 1) {
    return 5;
  } else if (count % 3 === 2) {
    return 190;
  } else {
    return 375;
  }
}

function calcPictureHeight(count) {
  if (count < 4) {
    return 5;
  } else if (count < 7) {
    return 262;
  } else {
    return 519;
  }
}

function getCardEditions(cardName) {
  return mongo.connect()
  .then(dbo => {
    return dbo.db().collection(process.env.BULK_DATA_COLLECTION)
    .find({name: cardName})
    .toArray()
      .then(docs => {
        dbo.close();
        return docs;
      });
  });
}

function createEditionObject(editions, bearerToken) {
  let editionImages = {};
  let tcgPromises = [];
  editions.forEach(edition => {    
    //add multiverseKey handling back in
    // var multiverseKey = edition.multiverse_ids[0];
    
    var shortVersion = nameShorten(edition.set_name);
    //adds TCGPlayer information if the edition exists in paper
    if (edition.tcgplayer_id !== undefined) {
      var purchaseLink = `https://shop.tcgplayer.com/product/productsearch?id=${edition.tcgplayer_id}`;
      var tcgApiUrl = String(
        `http://api.tcgplayer.com/v1.32.0/pricing/product/${edition.tcgplayer_id}`
      );
      var tcgHeaders = {
        Authorization: `bearer ${bearerToken}`,
        getExtendedFields: "true",
      };
      tcgPromises.push(axios.get(tcgApiUrl, { headers: tcgHeaders }));
    }
    if (edition["layout"] === "transform") {
      editionImages[edition.id] = {
        name: [edition.card_faces[0].name, edition.card_faces[1].name],
        version: shortVersion,
        image: [
          edition.card_faces[0].image_uris.small,
          edition.card_faces[1].image_uris.small,
        ],
        tcgId: edition.tcgplayer_id,
        tcgPurchase: purchaseLink,
      };
    } else {
      editionImages[edition.id] = {
        name: [edition.name],
        version: shortVersion,
        image: [edition.image_uris.small],
        tcgId: edition.tcgplayer_id,
        tcgPurchase: purchaseLink,
      };
    }
  })
  return Promise.all(tcgPromises)
  .then(result => {
    for (var id in editionImages) {
      if (editionImages[id]["tcgId"] == "undefined") {
        continue;
      }
      editionImages[id]["normalPrice"] = "";
      editionImages[id]["foilPrice"] = "";
      for (var edition of result) {
        if (
          editionImages[id].tcgId == edition.data.results[0].productId
        ) {
          edition.data.results.forEach(function (product) {
            if (product.subTypeName === "Normal") {
              editionImages[id].normalPrice = product.marketPrice;
            } else if (product.subTypeName === "Foil") {
              editionImages[id].foilPrice = product.marketPrice;
            }
          });
          break;
        }
        }
    }
    return editionImages;
  })
  .catch(error => {
    console.log(error);
  });
}

function comparator(a, b) {
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  return 0;
}

//name shortener helper function for cleaner presentation
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
