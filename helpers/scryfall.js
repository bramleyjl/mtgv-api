const axios = require('axios');

module.exports = {
  getRandomCard: function() {  
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
   }
}  