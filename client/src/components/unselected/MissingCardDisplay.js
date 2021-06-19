import React from "react";
import Tooltip from '@material-ui/core/Tooltip';
import mtgBack from '../../assets/magic_card_back.jpg';

class MissingCardDisplay extends React.Component {
  render() {

    return (
      <div>
        <li>
          <Tooltip title={<h3>Card Not Found</h3>} placement="top">
            <div className="unselectedEditionContainer">
              <div className="editionImage">
                <img
                  src={mtgBack}
                  alt={'Card Not Found'}
                />
              </div>
            </div>
          </Tooltip>
        </li>
      </div>
    );
  }
}

export default MissingCardDisplay;
