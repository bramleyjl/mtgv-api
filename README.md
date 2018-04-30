# MtG Script Automater

### [Live Development Build](http://MtGscript.bramley.design)

MtG Script Automater is a web application for quickly parsing text to find Magic: the Gathering card names and return their corresponding card images. Users can select from all available versions of each card and pick the version of their choice, then batch download high quality images of each card.

## Installation
MtG Script Automater is written in Node.js/Express and should be run in Node v8.10.0 or later.  

Node Package Manager (npm) is also required to install the various dependencies. A full list of the dependencies can be seen in the *package.json* file. Once Node and npm are installed, navigate to the project directory and run 
```
npm install
```
to add the required modules.

To launch MtG Script Automater run
```
node app.js
```
and navigate to the port indicated in the console.

## Usage

### Script Entry
To use MtG Script Automater, enter your desired text into the box and click the *Submit* button. Card names that you wish to pull must be explicitly denoted with square brackets(**[]**), like this:
```
[Serra Angel]
```
Square brackets **cannot** be used for other purposes in the script; they are reserved for card names only. Card name entry is case-insensitive and slightly fuzzy; for example, entering
```
[lanowar elve]
```
*(Only one **l** in 'lanowar', no **s** in 'elve')*

will still properly return the card *Llanowar Elves*.

### Image Select and Download
MtG Script Automater will iterate over all of the entered card names and return ordered lists of the existing versions of each card.

Click on the desired card's image to select it for download. Failure to select a specific version will result in the first image (cards are sorted alphabetically by edition) being downloaded. If you wish to choose a different card, click on the selected card to return all of the original options to view.

Once you have selected the desired version of each card, click the *Download Images* button. MtG Script Automater will package the images and original script into a *.zip* and download them.

#### Dual-Faced Cards
MTG Script Automater supports dual-faced card entry. Entering in either side of a card will result in both sides being displayed and downloaded. The two files will have the same file name, with the reverse side being prepended with `(reverse)`. For this reason it is recommended that you always enter in the front side of a card.

#### Edition Names
Each available version of a card will come labled with the set it is derived from. MTG Script Automater returns all possible versions of a card, including special collector's editions and online-only printings. The following editions have had their display names shortened for easier display:

* Duel Decks: &rarr; DD:

* Duel Decks Anthology &rarr; : DDA:

* Premium Deck Series: &rarr; PDS:

* Magic Online &rarr; MTGO

* Magic Player Rewards &rarr; MPR

* Friday Night Magic &rarr; FNM

* Pro Tour &rarr; PT

### Indexing, File Names, and Formats
MtG Script Automater indexes (one-based) cards based on the order in which they appear in the text input. The script and images are prepended with the index, like so:
```
(3)[dark ritual]
(3)dark_ritual.png
```
Card names in the script and images are unchanged from how they are originally entered, with the exception of whitespaces in image names, which are changed to underscores. The script downloads as a *.txt* and images as *.png* files.


## Technologies
* [Scryfall API](https://scryfall.com/docs/api) - Card search and image data.
* Node.js/Express
* [Skeleton CSS Boilerplate](http://getskeleton.com/)

## Authors
* [John Bramley](https://github.com/bramleyjl)
* [Ben Colsey](https://github.com/BColsey)

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details