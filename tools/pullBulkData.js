require("dotenv").config();
let axios = require('axios');
let fs = require('fs');
let MongoClient = require("mongodb").MongoClient;

function pullBulkData() {
	console.log(process.env.DB_URL)
	console.log(process.env.DB_NAME)
	return MongoClient.connect(process.env.DB_URL + process.env.DB_NAME, {
        useNewUrlParser: true,
    })
    .then(function (dbo) {
		let rawData = fs.readFileSync('assets/default-cards-20201130220401.json');
		let jsonData = JSON.parse(rawData);
      	return dbo.db().collection(process.env.BULK_DATA_COLLECTION).insertMany(jsonData, function (err, result) {
			if (err)
			   console.log('Error:' + err);
			else
			  console.log('Success');
		});
    })
    .catch((error) => {
		console.log(error);
	});

	// update to pull data directly from scryfall instead of downloaded json file

	// return axios
	// .get('https://api.scryfall.com/bulk-data/default_cards')
	// .then((response) => {
	// 	console.log(response)
    //     // return axios.get(response.data.download_uri);
	// })
	// .then((data) => {
	// 		business logic here
	// })
    // .catch(err => {
    //     console.log(err)
    // });
}

pullBulkData();
