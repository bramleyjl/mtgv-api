import React from "react";
import SelectedCardGroup from "./SelectedCardGroup";

class SelectedVersions extends React.Component {
  render() {
    let selectedCardGroups = [];
    for (let j = 0; j < this.props.cardImages.length; j++) {
      let cardInfo = this.props.cardImages[j];
      if (cardInfo.selected === false || cardInfo.cardFound === false) continue;
      selectedCardGroups.push(
        <SelectedCardGroup
          key={j}
          index={j}
          versionSelect={this.props.versionSelect}
          cardInfo={cardInfo}
        />
      );
    }

    return (
      <ul className="selectedVersions">
        {selectedCardGroups}
      </ul>
    );
  }
}

export default SelectedVersions