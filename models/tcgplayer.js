const axios = require("axios");
const mongo = require("../helpers/mongo");

module.exports = {
  addTcgPrices: function (editionImages, tcgResults) {
    editionImages.forEach(edition => {
      if (edition["tcgId"] == "undefined") { return }
      edition["normalPrice"] = "";
      edition["foilPrice"] = "";
      for (var result of tcgResults) {
        if (edition.tcgId == result.data.results[0].productId) {
          result.data.results.forEach(function (product) {
            if (product.subTypeName === "Normal") {
              edition.normalPrice = product.marketPrice;
            } else if (product.subTypeName === "Foil") {
              edition.foilPrice = product.marketPrice;
            }
          });
        }
      }
    });
    return editionImages;
  },
  getBearerToken: function () {
    return mongo.connect()
      .then(dbo => {
        return dbo.db().collection(process.env.TCG_COLLECTION).find().toArray();
      })
      .then(items => {
        let shouldRenew = items[0] ? (Date.parse(items[0].date) - Date.now() < 86400000) : true;
        if (shouldRenew) {
          console.log("TCGPlayer token expires soon, renewing...");
          return renewBearerToken();
        } else {
          return items[0].token;
        }
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function renewBearerToken() {
    var token = "";
    var expires = "";
    return axios
      .post(
        "https://api.tcgplayer.com/token",
        `grant_type=client_credentials&client_id=${process.env.TCG_CLIENT_ID}&client_secret=${process.env.TCG_CLIENT_SECRET}`,
        {headers: {"Content-Type": "text/plain"}}
      )
      .then(response => {
        token = response.data.access_token;
        expires = response.data[".expires"];
        return mongo.connect();
      })
      .then(dbo => {
        dbo.db().collection(process.env.TCG_COLLECTION).updateOne(
          {},
          { $set: { token: token, date: expires } },
          { upsert: true }
        );
        dbo.close();
        return token;
      })
      .catch(error => {
        console.log(error);
      });
  }
