import React, { Component } from "react";
import Loading from "./Loading";

import SelectedVersions from './SelectedVersions';
import UnselectedVersions from "./UnselectedVersions";


class VersionSelect extends Component {
  constructor(props) {
    super(props);
    this.handleVersionSelect = this.handleVersionSelect.bind(this);
    this.finalizeVersions = this.finalizeVersions.bind(this);
    this.state = {
      cardImages: this.props.cardImages
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cardImages !== this.props.cardImages) {
      this.setState({
        cardImages: this.props.cardImages
      });
    }
  }

  handleVersionSelect(index, selected, version) {
    var cardGroup = this.state.cardImages[index];
    if (selected === true) {
      cardGroup.selected = true;
      cardGroup.selectedVersion = Object.keys(version)[0];
    } else {
      cardGroup.selected = false;
    }
    var newCardImages = [...this.state.cardImages];
    newCardImages[index] = cardGroup;
    this.setState({
      cardImages: newCardImages
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
    return (
      <div>
      {this.props.loading ?
        <Loading loading={this.props.loading} /> :
        <form
         id="versionSelect"
          onSubmit={this.finalizeVersions.bind(this)}
        >
          <SelectedVersions 
            cardImages={this.state.cardImages}
            versionSelect={this.handleVersionSelect}
          />
          <UnselectedVersions
            cardImages={this.state.cardImages}
            versionSelect={this.handleVersionSelect}
          />
        </form>
      }
    </div>
    );
  }
}

export default VersionSelect;
