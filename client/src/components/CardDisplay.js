import React from "react";
import PurchaseButtons from "./PurchaseButtons.js";

class CardDisplay extends React.Component {
  render() {
    const { cardName, data, final, onClick } = this.props;
    var nonFoil = data.normalPrice ? "$" + data.normalPrice : "";
    var foil = data.foilPrice ? "$" + data.foilPrice : "";
    var tcgLink = data.tcgPurchase ? data.tcgPurchase : "";

    var purchaseButtons = "";
    if (data.tcgId !== undefined && final === false) {
      purchaseButtons = (
        <PurchaseButtons nonFoil={nonFoil} foil={foil} tcgLink={tcgLink} />
      );
    }

    return (
      <div>
        <div className="editionCaption">{data.version}</div>
        <li onClick={onClick}>
          <div className="editionContainer">
            <div className="editionImage">
              <img src={data.image[0]} alt={cardName + data.version} />
            </div>
            {data.image.length === 2 ? (
              <div className="editionImage">
                <img src={data.image[1]} alt={cardName + data.version} />
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
