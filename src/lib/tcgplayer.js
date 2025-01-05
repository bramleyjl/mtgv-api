const axios = require("axios");
const TcgpClient = require("../models/tcgpClient");

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
  getBearerToken: async function () {
    const client = new TcgpClient();
    const savedToken = await client.findAny()
    if (savedToken && (Date.parse(savedToken.date) - Date.now() > 86400000)) {
      return savedToken.token;
    } else {
      if (savedToken) { await client.delete(savedToken._id.toString()) }
      const renewedToken = await client.fetchToken()
      const tokenPayload = {
        token: renewedToken.access_token,
        date: renewedToken[".expires"]
      }
      await client.create(tokenPayload);
      return renewedToken.access_token;
    }
  }
};
