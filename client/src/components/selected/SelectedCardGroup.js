import React from "react";
import SelectedCardDisplay from "./SelectedCardDisplay";
import PriceButtons from "../PriceButtons.js";

class SelectedCardGroup extends React.Component {
  render() {
    const { displayName, count, versions, selectedVersion } = this.props.cardInfo;
    const displayVersion = versions[selectedVersion];
    const shouldDisplay = this.props.cardInfo.selected === true;
    
    let cards = [];
    for (var i = 1; i <= count; i++) {
      cards.push(
        <SelectedCardDisplay
        key={i}
        count={count}
        displayInfo={displayVersion}
        onClick={() => this.props.versionSelect(this.props.index, false)}
        />
      );
    }

    let priceButtons = "";
    if (displayVersion.tcgId !== undefined) {
      priceButtons = (
        <PriceButtons displayInfo={displayVersion} />
      );
    }

    return (
      <li className="cardName">
        <ul className="versionDisplay">
          <div className="editionContainer">
            {shouldDisplay && displayName + ": "}
            {shouldDisplay && displayVersion.version}
            {shouldDisplay && priceButtons}
            {shouldDisplay && cards}
          </div>
        </ul>
      </li>
    );
  }
}

export default SelectedCardGroup;
