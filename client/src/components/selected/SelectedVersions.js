import React from "react";
import Grid from "@material-ui/core/Grid";
import SelectedCardGroup from "./SelectedCardGroup";

class SelectedVersions extends React.Component {
  render() {
    let selectedCardGroups = [];
    for (let j = 0; j < this.props.cardImages.length; j++) {
      let cardInfo = this.props.cardImages[j];
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
    );
  }
}

export default SelectedVersions