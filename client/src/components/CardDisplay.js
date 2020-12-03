import React from "react";
import PurchaseButtons from "./PurchaseButtons.js";

class CardDisplay extends React.Component {
  render() {
    const { label, data, final, onClick } = this.props;
    var nonFoil = data.normalPrice ? "$" + data.normalPrice : "";
    var foil = data.foilPrice ? "$" + data.foilPrice : "";
    if (!nonFoil && !foil) {nonFoil = 'Price Unknown'}
    var tcgLink = data.tcgPurchase ? data.tcgPurchase : "";

    var purchaseButtons = "";
    if (data.tcgId !== undefined && final === false) {
      purchaseButtons = (
        <PurchaseButtons nonFoil={nonFoil} foil={foil} tcgLink={tcgLink} />
      );
    }

    return (
      <div>
        <li onClick={onClick}>
          <div className="editionContainer">
            <div className="editionCaption">{label}</div>
            <div className="editionImage">
              <img
                src={data.image[0]}
                alt={data.name[0] + " " + data.version}
              />
            </div>
            {data.image.length === 2 ? (
              <div className="editionImage">
                <img
                  src={data.image[1]}
                  alt={data.name[1] + " " + data.version}
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
