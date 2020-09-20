import React from "react";
import CardDisplay from "./CardDisplay";

class SelectCardGroup extends React.Component {
  constructor(props) {
    super(props);
    this.removeImages = this.removeImages.bind(this);
    this.restoreImages = this.restoreImages.bind(this);
    this.state = {
      liveImages: {},
      deadImages: {},
      selectedImage: {},
    };
  }

  componentDidMount() {
    this.restoreImages();
  }

  removeImages(selectedImage) {
    const selectedObject = {};
    selectedObject[selectedImage] = Object.values(this.props.details)[0][
      selectedImage
    ];
    this.setState({
      liveImages: {},
      deadImages: Object.values(this.props.details)[0],
      selectedImage: selectedObject,
    });
    this.props.versionSelect(this.props.index, selectedObject);
  }

  restoreImages() {
    this.setState({
      liveImages: Object.values(this.props.details)[0],
      deadImages: {},
      selectedImage: {},
    });
  }

  render() {
    var cardName = Object.keys(this.props.details)[0];
    var cardCount = Object.values(this.props.details)[1];

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
          {cardName} ({cardCount})
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
