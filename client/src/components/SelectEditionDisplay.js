import React from "react";
import Button from "@material-ui/core/Button";

class SelectEditionDisplay extends React.Component {
  render() {
    const { cardName, data, onClick } = this.props;
    if (data.tcgId != undefined) {
      var price = "Normal " + data.normalPrice;
      var foilPrice = "";
      if (data.foilPrice != null) foilPrice = "Foil " + data.foilPrice;
      var tcgLink = data.tcgPurchase;
    } else {
      var price = "Normal ???";
      var foilPrice = "Foil ???";
      var tcgLink = "";
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
          <Button color="primary" target="_blank" href={tcgLink}>
            {price}
          </Button>
          <Button color="primary" target="_blank" href={tcgLink}>
            {foilPrice}
          </Button>
        </li>
      </div>
    );
  }
}

export default SelectEditionDisplay;
