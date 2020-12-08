import React, { Component } from "react";

import Loading from "./Loading";
import VersionSelect from "./VersionSelect";

class CardVersions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unselectedVersions: this.props.cardImages,
      selectedVersions: []
    };
  }

  render() {
    return (
      <div>
        {this.props.loading ?
          <Loading loading={this.props.loading} /> :
          <VersionSelect
            cardImages={this.props.cardImages}
            handleVersionSelect={this.handleVersionSelect}
          />          
        }
      </div>
    );
  }
}

export default CardVersions;
