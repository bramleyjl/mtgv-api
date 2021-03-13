import React, { Component } from "react";
import UnselectedCardGroup from "./UnselectedCardGroup";

class UnselectedVersions extends Component {
  render() {
    let unselectedCardGroups = [];
    for (let j = 0; j < this.props.cardImages.length; j++) {
      let cardInfo = this.props.cardImages[j];
      if (cardInfo.selected === true) continue;
      unselectedCardGroups.push(
        <UnselectedCardGroup
          key={j}
          index={j}
          versionSelect={this.props.versionSelect}
          cardInfo={cardInfo}
        />
      );
    }

    return (
      <ul className="unselectedCardVersions">
        {unselectedCardGroups}
      </ul>
    );
  }
}

export default UnselectedVersions;