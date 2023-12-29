const axios = require('axios');
const mongo = require('../helpers/mongo');
const helper = require('../helpers/helper');

class Card {
  constructor(cardData = blankCardData()) {
    this.scryfall_id = cardData.scryfall_id,
    this.tcgplayer_id = cardData.tcgplayer_id
    this.name = cardData.name
    this.sanitized_name = cardData.sanitized_name,
    this.games = cardData.games
    this.set = cardData.set
    this.set_name = cardData.set_name
    this.collector_number = cardData.collector_number
    this.image_uris = cardData.image_uris
    this.released_at = cardData.released_at
    this.prices = cardData.prices
    this.card_faces = cardData.card_faces
    this.border_color = cardData.border_color
  }
}

module.exports = Card
// module.exports = {
//   getVersions: function (card) {
//     // return axios.get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
//     // return mongo.queryCardName(card)
//     // .then(response => {
//     return mongo.getCardVersions(card)
//     // })
//     .then(response => {
//       let editionImages = [];
//       response.forEach(edition => {
//         editionImages.push(buildEditionObject(edition));
//       });
//       return editionImages;
//     })
//     .catch(error => {
//       console.log(error);
//       if (error.response.status == 400 || error.response.status == 404) {
//         var noCard = {};
//         noCard[0] = {
//           name: [card],
//           version: "",
//           image: ["https://c1.scryfall.com/file/scryfall-cards/small/front/e/c/ec8e4142-7c46-4d2f-aaa6-6410f323d9f0.jpg?1561851198"],
//         };
//         return noCard;
//       } else {
//         console.log(error.response.data);
//       }
//     });
//   },
//   //
//   // old methods
//   //

//   getTextList: function(cards, format = 'arena') {
//     let list = '';
//     for (let card of cards) {
//       let listEntry = '';
//       let version = card.version;
//       let setCode = version.set.toUpperCase();
//       let collectorNumber = version.collectorNumber;
//       if (version.set_type === 'token') {
//         card.displayName += ' Token';
//         setCode = setCode.substring(1);
//       }
//       if (format === 'tcgApi') {
//         listEntry = `${card.count} ${card.displayName} [${setCode}]||`;
//       } else {
//         listEntry = `${card.count} ${card.displayName} (${setCode}) ${collectorNumber}`;
//       }
//       if (format === 'arena' && list.length > 0) {
//         list += "\n";
//       }
//       list += listEntry;
//     }
//     return list;
//   },
//   prepareVersionSelectList: function (cardNameCounts, imageLookups) {
//     let imagesArray = [];
//     let i = 0;
//     for (card of cardNameCounts) {
//       let cardVersions = imageLookups[i];
//       let primaryValues = Object.values(cardVersions)[0];
//       let displayObj = {
//         displayName: primaryValues.displayName,
//         name: primaryValues.name,
//         cardFound: primaryValues.version === "" ? false : true,
//         versions: cardVersions,
//         count: card.count,
//         selected: false,
//         selectedVersion: Object.keys(cardVersions)[0]
//       };
//       imagesArray[i] = displayObj;
//       i++;
//     }
//     return imagesArray;
//   },
// };

// function buildEditionObject(edition) {
//   let cardName, cardImage, displayName;
//   if (edition["layout"] === "transform" || edition['layout'] === 'modal_dfc') {
//     cardName = [edition.card_faces[0].name, edition.card_faces[1].name];
//     cardImage = [edition.card_faces[0].image_uris.small, edition.card_faces[1].image_uris.small];
//     displayName = cardName[0] + " // " + cardName[1];
//   } else {
//     cardName = [edition.name];
//     cardImage = [edition.image_uris.small];
//     displayName = cardName[0];
//   }
//   return {
//     id: edition.id,
//     name: cardName,
//     displayName: displayName,
//     set: edition.set,
//     collectorNumber: edition.collector_number,
//     version: helper.nameShorten(edition.set_name),
//     image: cardImage,
//     releasedAt: edition.released_at,
//     tcgId: edition.tcgplayer_id,
//     tcgPurchase: `https://shop.tcgplayer.com/product/productsearch?id=${edition.tcgplayer_id}`,
//     prices: edition.prices,
//     set_type: edition.set_type
//   };
// }

function blankCardData() {
  return {
    scryfall_id: null,
    tcgplayer_id: null,
    name: 'Blank',
    sanitized_name: 'blank',
    games: [],
    set: null,
    set_name: null,
    collector_number: null,
    image_uris: [],
    released_at: null,
    prices: {},
    card_faces: null,
    border_color: null
  }
}