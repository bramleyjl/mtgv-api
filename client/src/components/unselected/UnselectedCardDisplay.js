import React from "react";
import PurchaseButtons from "../PurchaseButtons.js";

class CardDisplay extends React.Component {
  render() {
    const { label, displayInfo, onClick } = this.props;

    var purchaseButtons = "";
    if (displayInfo.tcgId !== undefined) {
      purchaseButtons = (
        <PurchaseButtons displayInfo={displayInfo} />
      );
    }

    return (
      <div>
        <li onClick={onClick}>
          <div className="editionContainer">
            <div className="editionCaption">{label}</div>
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
          </div>
        </li>
        {purchaseButtons}
      </div>
    );
  }
}

export default CardDisplay;
