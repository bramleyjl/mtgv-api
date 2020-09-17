let axios = require('axios');
let fs = require('fs');

function pullBulkData() {
	return axios
	.get('https://api.scryfall.com/bulk-data/default_cards')
	.then((response) => {
		let downloadUri = response.data.download_uri;
		console.log(downloadUri);
        return axios.get(downloadUri);
	})
	.then((response) => {
		try {
			//
		} catch (err) {
			console.log(err);
		}
	})
    .catch(err => {
        console.log(err)
    });
}

pullBulkData();
