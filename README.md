# MtG Versioner API



## Setting Up MtG Versioner

### Prerequisites

The following dependencies are required to run a local instance of MtGVersioner:

* Node & Node Package Manager [npm](https://www.npmjs.com/)
* [MongoDB](https://www.mongodb.com/docs/manual/installation/)

### Installation
1. Install required NPM packages in both API (root) and `/client` directory:
    ```
    npm install
    cd client && npm install
    ```
2. Both the API and the web client have several environmental variables that must be set up. In the root directory create a `.env` file with the following:
    ```
      DB_URL=mongodb://localhost:27017/
      DB_NAME=MTGVersioner
      TCG_COLLECTION=tcgAPI
      BULK_DATA_COLLECTION=cardData
      TCG_CLIENT_ID=<your TCG client ID>
      TCG_CLIENT_SECRET=<your TCG client secret>
      PORT=4000
    ```
    Then, in the `/client` directory create another `.env`:
    ```
      REACT_APP_URL='http://localhost:4000'
      GENERATE_SOURCEMAP=false
    ```


3. MtG Versioner relies on cached data from [Scryfall](https://scryfall.com), run the following npm commands to import the latest list of card names and data:
  * `npm run pullBulkData`: if the tool has run successfully you will see a `Database updated: <#> entries added` log. You can also check your local MongoDB for an `MTGVersioner` DB with a populated `cardData` collection.

## Running MtG Versioner
To run a development build of MtGVersioner there are a variety of npm scripts in the root `package.json`.

## Routes


## Authors

- [John Bramley](https://github.com/bramleyjl)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
