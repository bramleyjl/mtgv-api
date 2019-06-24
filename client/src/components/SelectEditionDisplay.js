import React from "react";
import Button from "@material-ui/core/Button";

class SelectEditionDisplay extends React.Component {
  render() {
    const { cardName, data, onClick } = this.props;
    var nonFoil, foil, tcgLink = '';
    if (data.tcgId !== undefined) {
      if (data.normalPrice !== null) {
        nonFoil = "Price: $" + data.normalPrice;
      }
      if (data.foilPrice !== null) {
        foil = "Foil: $" + data.foilPrice;
      }
      tcgLink = data.tcgPurchase;
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
            {nonFoil}
          </Button>
          <Button color="primary" target="_blank" href={tcgLink}>
            {foil}
          </Button>
        </li>
      </div>
    );
  }
}

export default SelectEditionDisplay;
