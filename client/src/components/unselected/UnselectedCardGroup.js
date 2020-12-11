import React from "react";
import CardDisplay from "./UnselectedCardDisplay";

class SelectCardGroup extends React.Component {
  constructor(props) {
    super(props);
    this.versionSelect = this.versionSelect.bind(this);
    this.state = {
      versions: this.props.cardInfo.versions,
    };
  }

  versionSelect(selectedImage) {
    const selectedObject = {};
    selectedObject[selectedImage] = this.props.cardInfo.versions[selectedImage];
    this.props.versionSelect(this.props.index, true, selectedObject);
  }

  render() {
    var unselectedImages = [];
    if (this.props.cardInfo.cardFound === false) {
      unselectedImages.push(
        <CardDisplay
          key={0}
          label={"Card Not Found!"}
          data={this.state.versions[0]}
        />
      );
    } else {
      Object.keys(this.state.versions).forEach((key) => {
        var values = this.state.versions[key];
        unselectedImages.push(
          <CardDisplay
            key={key}
            label={values.version}
            displayInfo={values}
            onClick={() => this.versionSelect(key)}
          />
        );
      });
    }

    return (
      <li className="cardName">
        <h5>
          {this.props.cardInfo.selected === false && this.props.cardInfo.displayName}
        </h5>
        <ul className="versionDisplay">
          {this.props.cardInfo.selected === false && unselectedImages}
        </ul>
      </li>
    );
  }
}

export default SelectCardGroup;
