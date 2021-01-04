import React from "react";

class SelectedCardDisplay extends React.Component {
  render() {
    const { displayInfo, onClick, imageNumber } = this.props;
    const imgStyle = {
      position: 'absolute',
      top: (imageNumber * 20)
    };
    const secondImgStyle = {
      position: 'absolute',
      top: (imageNumber * 20),
      left: 145
    };

    return (
      <li onClick={onClick} className="selectedEditionContainer">
        <div className="editionImage selectedEditionImage">
          <img
            src={displayInfo.image[0]}
            alt={displayInfo.name[0] + " " + displayInfo.version}
          />
        </div>
        {displayInfo.image.length === 2 ? (
          <div className="editionImage selectedEditionImage">
            <img
              src={displayInfo.image[1]}
              alt={displayInfo.name[1] + " " + displayInfo.version}
            />
          </div>
        ) : null}
      </li>
    );
  }
}

export default SelectedCardDisplay;
