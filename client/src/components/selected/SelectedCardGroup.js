import React from "react";
import SelectedCardDisplay from "./SelectedCardDisplay";
import PriceButtons from "../PriceButtons.js";

class SelectedCardGroup extends React.Component {
  render() {
    const { displayName, count, versions, selectedVersion } = this.props.cardInfo;
    const displayCount = count > 4 ? 4 : count;
    const liStyle = { height: 270 + (displayCount * 20) + 'px' };
    const displayVersion = versions[selectedVersion];
    const shouldDisplay = this.props.cardInfo.selected === true;
    
    let priceButtons = "";
    if (displayVersion.tcgId !== undefined) {
      priceButtons = (
        <PriceButtons displayInfo={displayVersion} />
      );
    }

    let cards = [];
    for (var i = 1; i <= displayCount; i++) {
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
        <li className="selectedCardGroup" style={liStyle}>
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
