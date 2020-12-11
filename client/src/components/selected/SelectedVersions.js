import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";

import SelectedCardGroup from "./SelectedCardGroup";

class SelectedVersions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardImages: this.props.cardImages,
    };
  }

  render() {
    var selectedCardGroups = [];
    for (var j = 0; j < this.props.cardImages.length; j++) {
      var cardInfo = this.props.cardImages[j];
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
      <div>
        <Grid container>
          <Grid item xs={12}>
            <ol>{selectedCardGroups}</ol>
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default SelectedVersions