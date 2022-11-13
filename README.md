# MtG Versioner

MtG Versioner is a web application designed to help you quickly and easily select your preferred card versions for a Magic: the Gathering decklist. Users input a cardlist, then select from all available versions of each card and pick the version of their choice. Their selections can then be exported as an updated cardlist to TCGPlayer or batch downloaded as high quality images for playtest cards.

## Setting Up MtG Versioner
### Prerequisites
The follow dependencies are required to run a local instance of MtGVersioner:
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
    ```
    Then, in the `/client` directory create another `.env`:
    ```
      REACT_APP_URL='http://localhost:4000'
      GENERATE_SOURCEMAP=false
    ```


3. MtG Versioner relies on cached data from [Scryfall](https://scryfall.com), run the following npm commands to import the latest list of card names and data:
  * `npm run pullCardNames`: check in `client/src/assets/cardNames.json` to see the list of all unique card names.
  * `npm run pullBulkData`: if the tool has run successfully you will see a `Database updated: <#> entries added` log. You can also check your local MongoDB for an `MTGVersioner` DB with a populated `cardData` collection.

## Runing MtG Versioner
To run a development build of MtGVersioner there are a variety of npm scripts in the root `package.json`.



## Usage

### Script Entry

To use MtG Script Automater, enter your desired text into the box and click the _Submit_ button. Card names that you wish to pull must be explicitly denoted with square brackets(**[]**), like this:

```
[Serra Angel]
```

Square brackets **cannot** be used for other purposes in the script; they are reserved for card names only. Card name entry is case-insensitive and slightly fuzzy; for example, entering

```
[lanowar elve]
```

_(Only one **l** in 'lanowar', no **s** in 'elve')_

will still properly return the card _Llanowar Elves_.

### Image Select and Download

MtG Script Automater will iterate over all of the entered card names and return ordered lists of the existing versions of each card.

Click on the desired card's image to select it for download. Failure to select a specific version will result in the first image (cards are sorted alphabetically by edition) being downloaded. If you wish to choose a different card, click on the selected card to return all of the original options to view.

Once you have selected the desired version of each card, click the _Download Images_ button. MtG Script Automater will package the images and original script into a _.zip_ and download them.

#### Dual-Faced Cards

MTG Script Automater supports dual-faced card entry. Entering in either side of a card will result in both sides being displayed and downloaded. The two files will have the same file name, with the reverse side being prepended with `(reverse)`. For this reason it is recommended that you always enter in the front side of a card.

#### Edition Names

Each available version of a card will come labled with the set it is derived from. MTG Script Automater returns all possible versions of a card, including special collector's editions and online-only printings. The following editions have had their display names shortened for easier display:

- Duel Decks: &rarr; DD:

- Duel Decks Anthology &rarr; : DDA:

- Friday Night Magic &rarr; FNM

- Magic Online &rarr; MTGO

- Magic Player Rewards &rarr; MPR

- Premium Deck Series: &rarr; PDS:

- Pro Tour &rarr; PT



## Technologies

- [Scryfall API](https://scryfall.com/docs/api) - Card search and image data.
- Node.js/Express
- [Skeleton CSS Boilerplate](http://getskeleton.com/)

## Authors

- [John Bramley](https://github.com/bramleyjl)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
