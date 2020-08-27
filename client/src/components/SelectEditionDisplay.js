import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

class SelectEditionDisplay extends React.Component {
  render() {
    const { cardName, data, onClick } = this.props;
    var nonFoil,
      foil,
      tcgLink = "";
    if (data.tcgId !== undefined) {
      if (data.normalPrice !== null) {
        nonFoil = "$" + data.normalPrice;
      } else {
        nonFoil = null;
      }
      if (data.foilPrice !== null) {
        foil = "$" + data.foilPrice;
      } else {
        foil = null;
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
        </li>
        {data.tcgId !== undefined ? (
          <ButtonGroup
            color="primary"
            variant="contained"
            size="small"
            aria-label="Card Prices"
            style={{ boxShadow: "none", justifyContent: "center" }}
          >
            {nonFoil !== null ? (
              <Button variant="text" target="_blank" href={tcgLink}>
                {nonFoil}
              </Button>
            ) : null}
            {foil !== null ? (
              <Button
                variant="text"
                target="_blank"
                href={tcgLink}
                style={{
                  backgroundImage:
                    "linear-gradient(319deg, #ff1493 0%, #0000ff 37%, #ff8c00 100%)",
                }}
              >
                {foil}
              </Button>
            ) : null}
          </ButtonGroup>
        ) : null}
      </div>
    );
  }
}

export default SelectEditionDisplay;
