import 'dotenv/config';
import fs from 'fs';
import axios from 'axios';
import logger from "./lib/logger.js";

function pullCardNames() {
  const cardNamesPath = './src/assets/cardNames.json';
	return axios.get('https://api.scryfall.com/catalog/card-names')
	.then(response => {
    let cardNamesData = response.data;
    if (fs.existsSync(cardNamesPath)) {
      let existingData = JSON.parse(fs.readFileSync(cardNamesPath, 'utf8'));
      if (cardNamesData.total_values === existingData.total_values) {
        logger.info('No new card names found, exiting.');
        return
      }
    }
    fs.writeFileSync(cardNamesPath, JSON.stringify(cardNamesData), {encoding: 'utf8'});
    logger.info('Card names updated.');
  })
	.catch(err => {
    logger.info(err);
	});
}

pullCardNames();
