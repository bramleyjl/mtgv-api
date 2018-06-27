let axios = require('axios');

module.exports = {
  getRandomCard: function() {
    return axios.get(`https://api.scryfall.com/cards/random`)
      .then(response => {
        response = `[${response.data.name}]`;
        const landList = ['[Mountain]', '[Island]', '[Plains]', '[Swamp]', '[Forest]', '[Wastes]']
        if( landList.indexOf(response) != -1 ){
          console.log("Basic land %s found. Requesting new random card.", response)
          response = this.getRandomCard();
        }
        return response;
      })
  },
  //searches for selected card and returns all version images
  imageLookup: function(card) {
    return axios.get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
      .then(response => {
        const allEditions = response.data.prints_search_uri;
        return axios.get(allEditions);
      })
      .then(response => {
        let editionImages = {};
        for (var edition of response.data.data) {
          //shorten names
          var shortName = nameShorten(edition.set_name);
          //pushes front and back side images for dual-faced cards
          if (edition['layout'] === 'transform') {
            editionImages[shortName] =
              [
                edition.card_faces[0].image_uris.small,
                edition.card_faces[1].image_uris.small
              ];
          } else {
            editionImages[shortName] = [edition.image_uris.small];
          }
        }
        //sort editions alphabetically
        const orderedEditionImages = {};
        Object.keys(editionImages).sort().forEach(function(key) {
          orderedEditionImages[key] = editionImages[key];
        });
        return orderedEditionImages;
      })
      .catch(error => {
        console.log(error);
      });
  },
  //looks up .png image for a card based on passed-in .jpg link
  hiRezDownload: function(name, link) {
    //break early for card names that didn't convert to images successfully
    if (link === 'https://img.scryfall.com/errors/missing.jpg') {
      return undefined;
    }
    const oldLink = link;
    link = link.replace('small', 'png');
    link = link.replace('jpg', 'png');
    return axios.get(link)
      .then(response => {
        let downloadLink = {};
        downloadLink[name] = link;
        return downloadLink;
      })
      .catch(error => {
        console.log(error);
      });
  },
};

function comparator(a, b) {
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  return 0;
}

//name shortener helper function for cleaner presentation
function nameShorten(cardName) {
  const duelDecks = /^Duel Decks:/;
  cardName = cardName.replace(duelDecks, 'DD:');
  const duelDecksAnthology = /^Duel Decks Anthology:/;
  cardName = cardName.replace(duelDecksAnthology, 'DDA:');
  const fridayNightMagic = /^Friday Night Magic/;
  cardName = cardName.replace(fridayNightMagic, 'FNM');
  const magicOnline = /^Magic Online/;
  cardName = cardName.replace(magicOnline, 'MTGO');
  const magicPlayerRewards = /^Magic Player Rewards/;
  cardName = cardName.replace(magicPlayerRewards, 'MPR');
  const premiumDecks = /^Premium Deck Series:/;
  cardName = cardName.replace(premiumDecks, 'PDS');
  const proTour = /^Pro Tour/;
  cardName = cardName.replace(proTour, 'PT');
  return cardName;
}