import React, { Component } from "react";
import FinalCardGroup from "./FinalCardGroup";

import Grid from "@material-ui/core/Grid";
import NavBar from "./NavBar";
import Loading from "./Loading";

import { getCachedData } from "../helpers/helper.js";

class FinalizedImages extends Component {
  constructor(props) {
    super(props);
    this.returnToImageSelect = this.returnToImageSelect.bind(this);
    this.removeNonMatches = this.removeNonMatches.bind(this);
    this.state = {
      loading: true,
      cardList: "",
      versions: {},
      cardImages: false,
    };
  }

  componentDidMount() {
    var cardList = getCachedData("cardList", this.props.cardList);
    let versions = this.props.versions;
    if (versions) {
      versions = this.removeNonMatches(versions);
      localStorage.setItem("versions", JSON.stringify(versions));
    } else {
      versions = JSON.parse(localStorage.getItem("versions"));
    }

    this.setState({
      cardList: cardList,
      cardImages: versions,
      downloadButton: true,
      loading: false,
    });
  }

  returnToImageSelect(event) {
    event.preventDefault();
    this.props.history.push("/imageSelect");
  }

  removeNonMatches(versions) {
    var foundVersions = [];
    versions.forEach((version) => {
      if (version["0"] === undefined) {
        foundVersions.push(version);
      }
    });
    return foundVersions;
  }

  render() {
    var finalCardGroups = [];
    for (var i = 0; i < this.state.cardImages.length; i++) {
      var cardInfo = this.state.cardImages[i];
      finalCardGroups.push(
        <FinalCardGroup key={i} index={i} cardInfo={this.state.cardImages[i]} />
      );
    }

    return (
      <div>
        <NavBar
          downloadButton={this.state.downloadButton}
        />
        <Grid container>
          <Grid item xs={12}>
            <h1 className="pageTitle">Finalized Images</h1>
          </Grid>

          {this.state.loading ? (
            <Loading />
          ) : (
            <div>
              <Grid item xs={12}>
                <div className="scriptDisplay">
                  <input
                    type="hidden"
                    name="script"
                    value={this.state.cardList}
                  />
                  <h4>Entered Script:</h4>
                  <p id="baseScript">{this.state.cardList}</p>
                </div>
              </Grid>

              <Grid item xs={12}>
                <ol>{finalCardGroups}</ol>
              </Grid>
            </div>
          )}
        </Grid>
      </div>
    );
  }
}

export default FinalizedImages;
