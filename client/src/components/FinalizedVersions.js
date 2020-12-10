import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";

// import FinalCardGroup from "./FinalCardGroup";
import Loading from "./Loading";
import NavBar from "./NavBar";

import { getCachedData } from "../helpers/helper.js";

class FinalizedVersions extends Component {
  constructor(props) {
    super(props);
    this.returnToImageSelect = this.returnToImageSelect.bind(this);
    this.removeNonMatches = this.removeNonMatches.bind(this);
    this.state = {
      loading: true,
      cardList: "",
      cardImages: false,
    };
  }

  componentDidMount() {
    var cardList = getCachedData("cardList", this.props.cardList);
    let versions = this.props.finalizedVersions;
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
    this.props.history.push("/versionSelect");
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
      finalCardGroups.push(
        // <FinalCardGroup key={i} index={i} cardInfo={this.state.cardImages[i]} />
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

export default FinalizedVersions;
