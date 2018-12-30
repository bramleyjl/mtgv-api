import React from "react";
import Button from "@material-ui/core/Button";

class SelectEditionDisplay extends React.Component {
  render() {
    const { cardName, data, onClick } = this.props;
    const version = data[1];
    const frontImage = data[2][0];
    if (data[3] != undefined) {
      var price = "Normal " + data[5].normal;
      var foilPrice = "";
      if (data[5].foil != null) foilPrice = "Foil " + data[5].foil;
      var tcgLink = data[4];
    } else {
      var price = "Normal ???";
      var foilPrice = "Foil ???";
      var tcgLink = "";
    }

    return (
      <div>
        <div className="editionCaption">{version}</div>
        <li onClick={onClick}>
          <div className="editionContainer">
            <div className="editionImage">
              <img src={frontImage} alt={cardName + version} />
            </div>
            {data[2].length === 2 ? (
              <div className="editionImage">
                <img src={data[2][1]} alt={cardName + version} />
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
