import React from "react";
import SelectedCardDisplay from "./SelectedCardDisplay";
import PriceButtons from "../PriceButtons.js";

class SelectedCardGroup extends React.Component {
  render() {
    const { displayName, count, versions, selectedVersion } = this.props.cardInfo;
    const displayVersion = versions[selectedVersion];
    const shouldDisplay = this.props.cardInfo.selected === true;
    
    let priceButtons = "";
    if (displayVersion.tcgId !== undefined) {
      priceButtons = (
        <PriceButtons displayInfo={displayVersion} />
      );
    }

    let cards = [];
    for (var i = 1; i <= count; i++) {
      cards.push(
        <SelectedCardDisplay
          key={i}
          imageNumber={i - 1}
          displayInfo={displayVersion}
          onClick={() => this.props.versionSelect(this.props.index, false)}
        />
      );
    }

    return (
      shouldDisplay ?
        <li className="selectedCardGroup">
          {displayName}<br/>
          {displayVersion.version}
          {priceButtons}
          <ul className="selectedCardImages">
            {cards}
          </ul>
        </li>
      : null
    );
  }
}

export default SelectedCardGroup;
