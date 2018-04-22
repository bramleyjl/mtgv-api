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
                editionImages.push(edition.image_uris.small)
            }
            return editionImages;
        })
        .catch(error => {
            console.log(error);
        });
    },
    //looks up .png image for a card based on passed-in .jpg link
    hiRezDownload: function(name, link) {
        const oldLink = link;
        link = link.replace('small', 'png');
        link = link.replace('jpg', 'png');
        return axios.get(link)
        .then(response => {
            let downloadLink = new Object;
            downloadLink[name] = link;
            downloadLink[name + ' small'] = oldLink;
            return downloadLink;
        })
        .catch(error => {
            console.log(error);
        });
    }
};