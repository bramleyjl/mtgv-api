import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";

import UnselectedCardGroup from "./UnselectedCardGroup";

class UnselectedVersions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardImages: this.props.cardImages,
    };
  }

  render() {
    var unselectedCardGroups = [];
    for (var j = 0; j < this.props.cardImages.length; j++) {
      var cardInfo = this.props.cardImages[j];
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