import React from "react";
import SelectedCardDisplay from "./SelectedCardDisplay";
import PurchaseButtons from "../PurchaseButtons.js";

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

    let purchaseButtons = "";
    if (displayVersion.tcgId !== undefined) {
      purchaseButtons = (
        <PurchaseButtons displayInfo={displayVersion} />
      );
    }

    return (
      <li className="cardName">
        <ul className="versionDisplay">
          <div className="editionContainer">
            {shouldDisplay && displayName + ": "}
            {shouldDisplay && displayVersion.version}
            {shouldDisplay && purchaseButtons}
            {shouldDisplay && cards}
          </div>
        </ul>
      </li>
    );
  }
}

export default SelectedCardGroup;
