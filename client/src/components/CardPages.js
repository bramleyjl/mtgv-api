import React, { Component } from "react";
import SwitchComponent from './helpers/SwitchComponent';
import VersionSelect from "./VersionSelect";

class CardPages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardImages: this.props.cardImages,
      currentPage:this.props.currentPage
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cardImages !== this.props.cardImages) {
      this.setState({
        cardImages: this.props.cardImages
      });
    }
    if (prevProps.currentPage !== this.props.currentPage) {
      this.setState({
        currentPage: this.props.currentPage
      });
    }
  }

  render() {
    this.state.cardImages
    var pages = this.state.cardImages.map((images, index) => {
      return <VersionSelect
              key={index}
              name={index}
              cardImages={images}
             />
    });
    return (
      <SwitchComponent active={this.state.currentPage}>
        { pages }
      </SwitchComponent>
    );
  }
}

export default CardPages;
