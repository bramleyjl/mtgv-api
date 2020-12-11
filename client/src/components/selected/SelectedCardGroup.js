import React from "react";
import SelectedCardDisplay from "./SelectedCardDisplay";
import PurchaseButtons from "../PurchaseButtons.js";

class SelectedCardGroup extends React.Component {
  render() {
    let shouldDisplay = this.props.cardInfo.selected === true;
    let { displayName, count, versions, selectedVersion } = this.props.cardInfo;
    let displayVersion = versions[selectedVersion];
    
    var cards = [];
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

    var purchaseButtons = "";
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
