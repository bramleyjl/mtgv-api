import React, { Component } from "react";
import Loading from "./Loading";
import SelectedVersions from './selected/SelectedVersions';
import UnselectedVersions from "./unselected/UnselectedVersions";
import { textExport } from "../helpers/exportHelper";

class VersionSelect extends Component {
  constructor(props) {
    super(props);
    this.handleVersionSelect = this.handleVersionSelect.bind(this);
    this.exportVersions = this.exportVersions.bind(this);
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

  exportVersions = async (event) => {
    event.preventDefault();
    const cards = Object.values(this.state.cardImages);
    const allSelected = cards.filter(card => {
      return card.selected === false;
    });
    if (allSelected) {
      let confirm = window.confirm("Not all cards have selected versions, those cards will have the first version in the list selected. Continue?");
      if (confirm === false) {
        return;
      }
    }

    textExport(cards);
  }

  render() {
    return (
      <div>
      {this.props.loading ?
        <Loading loading={this.props.loading} /> :
        <form
         id="versionSelect"
          onSubmit={this.exportVersions.bind(this)}
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
