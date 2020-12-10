import React from "react";
import NewCardDisplay from "./NewCardDisplay";

class SelectedCardGroup extends React.Component {
  render() {
    let { displayName, count, versions, selectedVersion } = this.props.cardInfo;
    let displayVersion = versions[selectedVersion];
    var cards = [];
    for (var i = 1; i <= count; i++) {
      cards.push(
        <NewCardDisplay
          key={i}
          label={displayName}
          count={count}
          displayInfo={displayVersion}
          onClick={() => this.props.versionSelect(this.props.index, false)}
        />
      );
    }

    return (
      <li className="cardName">
        <ul className="versionDisplay">{this.props.cardInfo.selected === true && cards}</ul>
      </li>
    );
  }
}

export default SelectedCardGroup;
