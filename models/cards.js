let axios = require('axios');

module.exports = {
    //searches for selected card and returns all version images
    imageLookup : function(card) {
        return axios.get(`https://api.scryfall.com/cards/named?fuzzy=${card}`)
        .then(response => {
            const allEditions = response.data.prints_search_uri
            return axios.get(allEditions)
        })
        .then(response => {
            let editionImages = new Array;
            for (edition of response.data.data) {
                editionImages.push([edition.set_name, edition.image_uris.small])
            }
            //shorten names for better title display
            for (title of editionImages) {
                const duelDecks = /^Duel Decks:/
                title[0] = title[0].replace(duelDecks, 'DD:');
                const duelDecksAnthology = /^Duel Decks Anthology:/
                title[0] = title[0].replace(duelDecksAnthology, 'DDA:');
                const premiumDecks = /^Premium Deck Series:/
                title[0] = title[0].replace(premiumDecks, 'PDS');
                const magicOnline = /^Magic Online/
                title[0] = title[0].replace(magicOnline, 'MTGO');
                const magicPlayerRewards = /^Magic Player Rewards/
                title[0] = title[0].replace(magicPlayerRewards, 'MPR');
                const fridayNightMagic = /^Friday Night Magic/
                title[0] = title[0].replace(fridayNightMagic, 'FNM');
                const proTour = /^Pro Tour/
                title[0] = title[0].replace(proTour, 'PT');                
            }
            //alphabetize by version name
            function Comparator(a, b) {
                if (a[0] < b[0]) return -1;
                if (a[0] > b[0]) return 1;
                return 0;
            }
            editionImages = editionImages.sort(Comparator);
            return editionImages;
        })
        .catch(error => {
            console.log(error);
        });
    },
    //looks up .png image for a card based on passed-in .jpg link
    hiRezDownload: function(name, link) {
        //break early for card names that didn't convert to images successfully
        if (link.length === 0) {
            return undefined;
        }
        const oldLink = link;
        link = link.replace('small', 'png');
        link = link.replace('jpg', 'png');
        return axios.get(link)
        .then(response => {
            let downloadLink = new Object;
            downloadLink[name] = link;
            return downloadLink;
        })
        .catch(error => {
            console.log(error);
        });
    }
};