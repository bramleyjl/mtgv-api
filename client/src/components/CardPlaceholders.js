import React, { Component } from "react";
import ReactMarkdown from "react-markdown";

const markdown = `
## Welcome to Mtg Versioner!

### Step 1: Add cards to the the list, like so:
##### 2 Birds of Paradise
##### 4 Lightning Bolt
##### 3 Jace, the Mind Sculptor

### Step 2: Click on the version of the card you wish to select

### Step 3: Use the 'Export' button to download a text file with your selected versions or 'Purchase' to buy them from TCGPlayer
`;

class CardPlaceholders extends Component {  
  render() {
    return (
      <div className="placeHolderText">
        <ReactMarkdown children={markdown} />
      </div>
    );
  }
}

export default CardPlaceholders;