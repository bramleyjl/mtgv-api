import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import UnselectedCardGroup from "./UnselectedCardGroup";

class UnselectedVersions extends Component {
  render() {
    let unselectedCardGroups = [];
    for (let j = 0; j < this.props.cardImages.length; j++) {
      let cardInfo = this.props.cardImages[j];

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
      <div>
        <Grid container>
          <Grid item xs={12}>
            <ol>{unselectedCardGroups}</ol>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default UnselectedVersions;