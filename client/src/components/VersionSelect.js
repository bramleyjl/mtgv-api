import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";

import SelectCardGroup from "./SelectCardGroup";


class VersionSelect extends Component {
  constructor(props) {
    super(props);
    this.versionSelect = this.versionSelect.bind(this);
    this.finalizeVersions = this.finalizeVersions.bind(this);
    this.state = {
      cardImages: this.props.cardImages,
    };
    console.log(this.props.cardImages);
  }

  versionSelect(index, version) {
    this.setState({
      selectedVersions: { ...this.state.selectedVersions, [index]: version },
    });
  }

  finalizeVersions(event) {
    event.preventDefault();
    var versionSubmit = [];
    const cardEntries = Object.values(this.state.cardImages);
    const selectedVersions = this.state.selectedVersions;
    var i = 0;
    cardEntries.forEach(function (card) {
      if (!(i in selectedVersions)) {
        var autoSelect = {};
        var firstKey = Object.keys(card.versions)[0];
        autoSelect[firstKey] = card.versions[firstKey];
        autoSelect["count"] = card["count"];
        versionSubmit[i] = autoSelect;
      } else {
        selectedVersions[i]["count"] = card["count"];
        versionSubmit[i] = selectedVersions[i];
      }
      i++;
    });
    this.props.handleVersionSelect(versionSubmit);
    this.props.history.push("/finalizedVersions");
  }

  render() {
    var selectCardGroups = [];

      for (var j = 0; j < this.props.cardImages.length; j++) {
        var cardInfo = this.props.cardImages[j];
        selectCardGroups.push(
          <SelectCardGroup
          key={j}
          index={j}
          versionSelect={this.versionSelect}
          cardInfo={cardInfo}
          />
        );
      }

    return (
      <div>
        <Grid container>
            <form
              id="versionSelect"
              onSubmit={this.finalizeVersions.bind(this)}
            >
              <Grid item xs={12}>
                <ol>{selectCardGroups}</ol>
              </Grid>
            </form>
        </Grid>
      </div>
    );
  }
}

export default VersionSelect;
