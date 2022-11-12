require("dotenv").config();
const fs = require('fs');
const axios = require('axios');

function pullCardNames() {
  const cardNamesPath = './client/src/assets/cardNames.json';
	return axios.get('https://api.scryfall.com/catalog/card-names')
	.then(response => {
    let cardNamesData = response.data;
    if (fs.existsSync(cardNamesPath)) {
      let existingData = JSON.parse(fs.readFileSync(cardNamesPath, 'utf8'));
      if (cardNamesData.total_values === existingData.total_values) {
        console.log('No new card names found, exiting.');
        return
      }
    }
    fs.writeFileSync(cardNamesPath, JSON.stringify(cardNamesData), {encoding: 'utf8'});
    console.log('Card names updated.');
  })
	.catch(err => {
    console.log(err);
	});
}

pullCardNames();
