import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";

import SelectCardGroup from "./SelectCardGroup";
import NavBar from "./NavBar";
import Loading from "./Loading";

import { getCachedData } from "../helpers/helper.js";

class ImageSelect extends Component {
  constructor(props) {
    super(props);
    this.versionSelect = this.versionSelect.bind(this);
    this.finalizeVersions = this.finalizeVersions.bind(this);
    this.state = {
      loading: true,
      cardList: "",
      cardImages: {},
      selectButton: false,
      selectedVersions: {},
    };
  }

  componentDidMount() {
    var cardList = getCachedData("cardList", this.props.cardList);
    this.fetchPreviews(cardList);
  }

  fetchPreviews = async (cardList) => {
    const config = {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        cardList: cardList,
      }),
    };
    const response = await fetch(
      process.env.REACT_APP_URL + "/api/imageSelect",
      config
    );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    if (body.userAlert !== "") {
      window.alert(body.userAlert);
    }
    this.setState({
      cardList: body.cardList,
      cardImages: body.cardImages,
      selectButton: true,
      loading: false,
    });
    return body;
  };

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
    this.props.handleImageSelect(this.state.cardList, versionSubmit);
    this.props.history.push("/finalizedImages");
  }

  render() {
    var selectCardGroups = [];
    for (var j = 0; j < this.state.cardImages.length; j++) {
      var cardInfo = this.state.cardImages[j];
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
        <NavBar selectButton={this.state.selectButton} />
        <Grid container>
          <Grid item xs={12}>
            <h1 className="pageTitle">Version Select</h1>
          </Grid>

          {this.state.loading ? (
            <Loading loading={this.state.loading} />
          ) : (
            <form
              id="versionSelect"
              onSubmit={this.finalizeVersions.bind(this)}
            >
              <Grid item xs={12}>
                <div className="scriptDisplay">
                  <input
                    type="hidden"
                    name="script"
                    value={this.state.cardList}
                  />
                  <h3>Card List:</h3>
                  <p id="baseScript">{this.state.cardList}</p>
                </div>
              </Grid>

              <Grid item xs={12}>
                <ol>{selectCardGroups}</ol>
              </Grid>
            </form>
          )}
        </Grid>
      </div>
    );
  }
}

export default ImageSelect;
