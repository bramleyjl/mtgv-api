import React from "react";
import CardDisplay from "./CardDisplay";

class SelectCardGroup extends React.Component {
  constructor(props) {
    super(props);
    this.removeImages = this.removeImages.bind(this);
    this.restoreImages = this.restoreImages.bind(this);
    this.state = {
      allImages: this.props.cardInfo.versions,
      liveImages: this.props.cardInfo.versions,
      selectedImage: {},
    };
  }

  componentDidMount() {
    this.restoreImages();
  }

  removeImages(selectedImage) {
    const selectedObject = {};
    selectedObject[selectedImage] = this.props.cardInfo.versions[selectedImage];
    this.setState({
      liveImages: {},
      selectedImage: selectedObject,
    });
    this.props.versionSelect(this.props.index, selectedObject);
  }

  restoreImages() {
    this.setState({
      liveImages: this.state.allImages,
      selectedImage: {},
    });
  }

  render() {
    var cardInfo = this.props.cardInfo;
    var cardName = cardInfo.name[0];
    cardName += cardInfo.name[1] ? " // " + cardInfo.name[1] : "";

    var liveImages = [];
    Object.keys(this.state.liveImages).forEach((key) => {
      var values = this.state.liveImages[key];
      liveImages.push(
        <CardDisplay
          key={key}
          label={values.version}
          data={values}
          final={false}
          onClick={() => this.removeImages(key)}
        />
      );
    });

    var selectedImage = [];
    Object.keys(this.state.selectedImage).forEach((key) => {
      var values = this.state.selectedImage[key];
      selectedImage = [
        <CardDisplay
          key={key}
          label={values.version}
          data={values}
          final={false}
          onClick={() => this.restoreImages()}
        />,
      ];
    });

    return (
      <li className="cardName">
        <h5>
          {cardName} x{cardInfo.count}
        </h5>
        <ul className="versionDisplay">
          {liveImages}
          {selectedImage}
        </ul>
      </li>
    );
  }
}

export default SelectCardGroup;
