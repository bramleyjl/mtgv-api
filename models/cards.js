let axios = require("axios");
let MongoClient = require('mongodb').MongoClient;

module.exports = {
  getRandomCard: function() {
    return axios.get(`https://api.scryfall.com/cards/random`).then(response => {
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
  imageLookup: function(card, token) {
    return axios
      .get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
      .then(response => {
        const allEditions = response.data.prints_search_uri;
        return axios.get(allEditions);
      })
      .then(response => {
        return createEditionObject(response, token);
      })
      .then(response => {
        //sort editions alphabetically
        const orderedEditionImages = {};
        console.log(response);
        Object.keys(response)
          .sort()
          .forEach(function(key) {
            orderedEditionImages[key] = response[key];
          });
        return orderedEditionImages;
      })
      .catch(error => {
        if (error.response.status == 400 || error.response.status == 404) {
          var noCard = {};
          noCard[0] = [
            [card],
            "Card Not Found",
            ["https://img.scryfall.com/errors/missing.jpg"]
          ];
          return noCard;
        } else {
          console.log(error);
        }
      });
  },
  getBearerToken: function() {
    return MongoClient.connect(process.env.DB_URL + process.env.DB_NAME, { useNewUrlParser: true })
    .then(function(dbo) {
      return dbo.db().collection(process.env.TCG_COLLECTION).find().toArray();
    })
    .then(function(items) {
      var expire = Date.parse(items[0].Date);
      if ((expire - Date.now()) < 86400000) {
        console.log('TCGPlayer token expires soon, renewing...');
        return renewBearerToken();
      } else {
        return items[0].token;
      }
    })
    .catch(error => {
      console.log(error);
    });    
  }  
};

function renewBearerToken() {
  var body = `grant_type=client_credentials&client_id=${process.env.TCG_CLIENT_ID}&client_secret=${process.env.TCG_CLIENT_SECRET}`;
  var token = '';
  var expires = '';
  return axios.post('https://api.tcgplayer.com/token', body, { headers:{'Content-Type' : 'text/plain' }})
  .then(response => {
    token = response.data.access_token;
    expires = response.data['.expires'];
    return MongoClient.connect(process.env.DB_URL + process.env.DB_NAME, { useNewUrlParser: true })
  })
  .then(function(dbo) {
    return dbo.db().collection(process.env.TCG_COLLECTION).updateOne({}, {$set: { token : token, Date: expires }});
  })
  .then(function(results) {
    return token;
  })
  .catch(error => {
    console.log(error);
  });
};

function createEditionObject(response, bearerToken, passdown = {}) {
  let editionImages = passdown;
  let responseObject = response;
  let tcgPromises = [];
  for (var edition of responseObject.data.data) {
    //shorten names and add Collector's Number for multiple artworks
    var multiverseKey = edition.multiverse_ids[0];
    var shortVersion = nameShorten(edition.set_name);
    //adds TCGPlayer information if the edition exists in paper
    if (edition.tcgplayer_id !== undefined) {
      var purchaseLink = edition.purchase_uris.tcgplayer.substr(0, edition.purchase_uris.tcgplayer.indexOf("?"));
      var tcgApiUrl = String(`https://api.tcgplayer.com/v1.9.0/pricing/product/${edition.tcgplayer_id}`);
      var tcgHeaders = {
        Authorization: `bearer ${bearerToken}`,
        getExtendedFields: "true"
      };
      tcgPromises.push(axios.get(tcgApiUrl, { headers: tcgHeaders }));
    }
    //pushes front and back side images for dual-faced cards
    if (edition["layout"] === "transform") {
      editionImages[multiverseKey] = {
        name: [edition.card_faces[0].name, edition.card_faces[1].name],
        version: shortVersion,
        image: [edition.card_faces[0].image_uris.small, edition.card_faces[1].image_uris.small],
        tcgId: edition.tcgplayer_id,
        tcgPurchase: purchaseLink
      };
    } else {
      editionImages[multiverseKey] = {
        name: [edition.name],
        version: shortVersion,
        image: [edition.image_uris.small],
        tcgId: edition.tcgplayer_id,
        tcgPurchase: purchaseLink
      };
    }
  }
  return Promise.all(tcgPromises)
    .then(result => {
      for (var multiKey in editionImages) {
        if (editionImages[multiKey]['tcgId'] == "undefined") {
          continue;
        }
        editionImages[multiKey]['normalPrice'] = '';
        editionImages[multiKey]['foilPrice'] = '';
        for (var edition of result) {
          if (editionImages[multiKey].tcgId == edition.data.results[0].productId) {
            editionImages[multiKey].normalPrice = edition.data.results[0].marketPrice;
            editionImages[multiKey].foilPrice = edition.data.results[1].marketPrice;
            break;
          }
        }
      }
      if (responseObject.data.has_more === true) {
        return axios
          .get(responseObject.data.next_page)
          .then(response => {
            return createEditionObject(response, token, editionImages);
          })
          .catch(function() {
            return editionImages;
          });
      } else {
        return editionImages;
      }
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
  const duelDecks = /^Duel Decks:/;
  cardName = cardName.replace(duelDecks, "DD:");
  const duelDecksAnthology = /^Duel Decks Anthology:/;
  cardName = cardName.replace(duelDecksAnthology, "DDA:");
  const fridayNightMagic = /^Friday Night Magic/;
  cardName = cardName.replace(fridayNightMagic, "FNM");
  const magicOnline = /^Magic Online/;
  cardName = cardName.replace(magicOnline, "MTGO");
  const magicPlayerRewards = /^Magic Player Rewards/;
  cardName = cardName.replace(magicPlayerRewards, "MPR");
  const premiumDecks = /^Premium Deck Series:/;
  cardName = cardName.replace(premiumDecks, "PDS");
  const proTour = /^Pro Tour/;
  cardName = cardName.replace(proTour, "PT");
  return cardName;
}
