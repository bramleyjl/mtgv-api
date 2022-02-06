import React, { Component } from "react";
import SelectedVersions from './selected/SelectedVersions';
import UnselectedVersions from "./unselected/UnselectedVersions";

class VersionSelect extends Component {
  constructor(props) {
    super(props);
    this.handleCardPages = this.handleCardPages.bind(this);
    this.state = {
      cardImages: this.props.cardImages,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cardImages !== this.props.cardImages) {
      this.setState({
        cardImages: this.props.cardImages
      });
    }
  }

  handleCardPages(index, selected, version) {
    let cardGroup = this.state.cardImages[index];
    if (selected === true) {
      cardGroup.selected = true;
      cardGroup.selectedVersion = Object.keys(version)[0];
    } else {
      cardGroup.selected = false;
    }
    let newCardImages = [...this.state.cardImages];
    newCardImages[index] = cardGroup;
    this.setState({
      cardImages: newCardImages
    });
  }

  render() {
    return (
      <div className="versionSelectWrapper">
        <div className="versionSelect">
          <SelectedVersions
            cardImages={this.state.cardImages}
            versionSelect={this.handleCardPages}
          />
          <UnselectedVersions
            cardImages={this.state.cardImages}
            versionSelect={this.handleCardPages}
          />
        </div>
      </div>
    );
  }
}

export default VersionSelect;
