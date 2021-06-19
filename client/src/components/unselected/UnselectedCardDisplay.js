import React from "react";
import PriceButtons from "../PriceButtons.js";
import Tooltip from '@material-ui/core/Tooltip';

class CardDisplay extends React.Component {
  render() {
    const { label, displayInfo, onClick } = this.props;
    let priceButtons = "";
    if (displayInfo.tcgId !== undefined) {
      priceButtons = (
        <PriceButtons displayInfo={displayInfo} />
      );
    }

    return (
      <div>
        <li onClick={onClick}>
          <Tooltip title={<h3>{label}</h3>} placement="top">
            <div className="unselectedEditionContainer">
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
          </Tooltip>
        </li>
        {priceButtons}
      </div>
    );
  }
}

export default CardDisplay;
