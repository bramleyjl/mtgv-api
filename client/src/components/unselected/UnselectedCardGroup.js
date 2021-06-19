import React from "react";
import CardDisplay from "./UnselectedCardDisplay";
import MissingCardDisplay from "./MissingCardDisplay";

class UnselectedCardGroup extends React.Component {
  constructor(props) {
    super(props);
    this.versionSelect = this.versionSelect.bind(this);
  }

  versionSelect(selectedImage) {
    let selectedObject = {};
    selectedObject[selectedImage] = this.props.cardInfo.versions[selectedImage];
    this.props.versionSelect(this.props.index, true, selectedObject);
  }

  render() {
    const { cardInfo } = this.props;
    const versions = cardInfo.versions;

    let unselectedImages = [];
    let listEntry;
    if (cardInfo.cardFound === false) {
      unselectedImages.push( <MissingCardDisplay key={0} /> );
      listEntry = 'Not Found';
    } else {
      Object.keys(versions).forEach((key) => {
        let values = versions[key];
        unselectedImages.push(
          <CardDisplay
            key={key}
            label={values.version}
            displayInfo={values}
            onClick={() => this.versionSelect(key)}
          />
        );
      });
      if (cardInfo.selected === false) {
        listEntry = `${cardInfo.count} ${cardInfo.displayName}`;
      }
    }

    return (
      <li className="unselectedCardGroup">
        <h3>
          {listEntry}
        </h3>
        <ul className="unselectedCardImages">
          {unselectedImages}
        </ul>
      </li>
    );
  }
}

export default UnselectedCardGroup;
