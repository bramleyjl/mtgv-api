import React from "react";
import PurchaseButtons from "./PurchaseButtons.js";

class NewCardDisplay extends React.Component {
  render() {
    const { count, displayInfo, label, onClick } = this.props;
    // var nonFoil = data.normalPrice ? "$" + data.normalPrice : "";
    // var foil = data.foilPrice ? "$" + data.foilPrice : "";
    // if (!nonFoil && !foil) {
    //   nonFoil = 'Price Unknown';
    // }
    // var tcgLink = data.tcgPurchase ? data.tcgPurchase : "";

    // var purchaseButtons = "";
    // if (data.tcgId !== undefined && final === false) {
    //   purchaseButtons = (
    //     <PurchaseButtons nonFoil={nonFoil} foil={foil} tcgLink={tcgLink} />
    //   );
    // }

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
        {/* {purchaseButtons} */}
      </div>
    );
  }
}

export default NewCardDisplay;
