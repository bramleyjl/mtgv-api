const mongo = require("../helpers/mongo");

module.exports = {
  //grabs stored TCGPlayer API token or generatese a new one if it's expired
  getBearerToken: function () {
    return mongo.connect()
      .then(function (dbo) {
        return dbo.db().collection(process.env.TCG_COLLECTION).find().toArray();
      })
      .then(function (items) {
        if (items.length === 0) {
          return renewBearerToken();
        }
        var expire = Date.parse(items[0].Date);
        if (expire - Date.now() < 86400000) {
          console.log("TCGPlayer token expires soon, renewing...");
          return renewBearerToken();
        } else {
          return items[0].token;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },
}

function renewBearerToken() {
    var body = `grant_type=client_credentials&client_id=${process.env.TCG_CLIENT_ID}&client_secret=${process.env.TCG_CLIENT_SECRET}`;
    var token = "";
    var expires = "";
    return axios
      .post("https://api.tcgplayer.com/token", body, {
        headers: { "Content-Type": "text/plain" },
      })
      .then((response) => {
        token = response.data.access_token;
        expires = response.data[".expires"];
        return mongo.connect();
      })
      .then(function (dbo) {
        return dbo
          .db()
          .collection(process.env.TCG_COLLECTION)
          .updateOne(
            {},
            { $set: { token: token, Date: expires } },
            { upsert: true }
          );
      })
      .then(function (results) {
        return token;
      })
      .catch((error) => {
        console.log(error);
      });
  }
