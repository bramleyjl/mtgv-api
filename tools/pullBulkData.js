require("dotenv").config();
const assert = require('assert');
const axios = require('axios');
const mongo = require("../helpers/mongo");

function pullBulkData() {
	return axios
	.get('https://api.scryfall.com/bulk-data/default_cards')
	.then(response => {
		console.log('Downloading bulk data...')
		return axios.get(response.data.download_uri);
	})
	.then(cards => {
		updateCardData(cards.data);
	})
	.catch(err => {
	    console.log(err);
	});
}

function updateCardData(cards) {
	mongo.connect(function(err, client) {
		assert.strictEqual(err, null);
		console.log('Connected to database...');
		const collection = client
			.db(process.env.DB_NAME)
			.collection(process.env.BULK_DATA_COLLECTION);
		collection.deleteMany( {} )
		.then(res => {
			assert.strictEqual(err, null);
			console.log('Database cleared: ' + res.deletedCount + ' entries deleted');
			return collection.insertMany(cards, function(err, res) {
				assert.strictEqual(err, null);
				console.log('Database updated: ' + res.insertedCount + ' entries added');
				client.close();
			});
		})
		.catch(err => {
			console.log(err);
		});
	});
}

pullBulkData();
