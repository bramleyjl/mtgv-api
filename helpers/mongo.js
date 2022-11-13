const MongoClient = require("mongodb").MongoClient;

module.exports = {
    connect: function(callback = '') {
        debugger;
        db_uri = `${process.env.DB_URL}/${process.env.DB_NAME}`;
        return MongoClient.connect(
            db_uri,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            },
            callback
        );
    }
};
