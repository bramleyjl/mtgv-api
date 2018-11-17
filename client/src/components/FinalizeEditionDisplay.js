import React from 'react';
import Button from '@material-ui/core/Button';

class FinalizeEditionDisplay extends React.Component {

  render() {
    const { cardName, data} = this.props;
    const version = data[1];
    const frontImage = data[2][0];

    return (
      <div>
        <li>
          <div className="editionContainer">
            <div className="editionImage">
              <img src={frontImage} alt={cardName + version} />
            </div>
            { data[2].length === 2 ? 
              <div className="editionImage">
                <img src={data[2][1]} alt={cardName + version} />
              </div> 
              : null 
            }
          </div>     
        </li>
      </div>
    )
  }
}

export default FinalizeEditionDisplay;