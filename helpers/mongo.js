const MongoClient = require("mongodb").MongoClient;

module.exports = {
    connect: function (callback = '') {
        return MongoClient.connect(
            process.env.DB_URL + process.env.DB_NAME,
            { useNewUrlParser: true },
            callback
        );
    },
};
