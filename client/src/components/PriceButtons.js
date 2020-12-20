import React from "react";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";

class PriceButtons extends React.Component {
  render() {
    const { displayInfo } = this.props;
    var nonFoil = displayInfo.normalPrice ? "$" + displayInfo.normalPrice : "";
    var foil = displayInfo.foilPrice ? "$" + displayInfo.foilPrice : "";
    if (!nonFoil && !foil) {
      nonFoil = 'Price Unknown';
    }
    var tcgLink = displayInfo.tcgPurchase ? displayInfo.tcgPurchase : "";

    return (
      <div>
        <ButtonGroup
          color="primary"
          variant="contained"
          size="small"
          aria-label="Card Prices"
          style={{ boxShadow: "none", justifyContent: "center" }}
        >
          {nonFoil !== "" ? (
            <Button variant="text" style={{textTransform: 'none'}} target="_blank" href={tcgLink}>
              {nonFoil}
            </Button>
          ) : null}
          {foil !== "" ? (
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
      </div>
    );
  }
}

export default PriceButtons;
