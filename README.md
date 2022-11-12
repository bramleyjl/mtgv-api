# MtG Versioner

MtG Versioner is a web application designed to help you quickly and easily select your preferred card versions for a Magic: the Gathering decklist. Users input a cardlist, then select from all available versions of each card and pick the version of their choice. Their selections can then be exported as an updated cardlist to TCGPlayer or batch downloaded as high quality images for playtest cards.

## Setting Up MtG Versioner
### Prerequisites
The follow dependencies are required to run a local instance of MtGVersioner:
* Node Package Manager [npm](https://www.npmjs.com/)
* React?
* MongoDB

### Installation
```
npm install
cd client && npm install
```
- add `package.json` instructions

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
