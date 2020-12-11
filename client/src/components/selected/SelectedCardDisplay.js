import React from "react";

class NewCardDisplay extends React.Component {
  render() {
    const { displayInfo, onClick } = this.props;

    return (
      <div>
        <li onClick={onClick}>
          <div className="editionImage">
            <img
              src={displayInfo.image[0]}
              alt={displayInfo.name[0] + " " + displayInfo.version}
            />
          </div>
          {displayInfo.image.length === 2 ? (
            <div className="editionImage">
              <img
                src={displayInfo.image[1]}
                alt={displayInfo.name[1] + " " + displayInfo.version}
              />
            </div>
          ) : null}
        </li>
      </div>
    );
  }
}

export default NewCardDisplay;
