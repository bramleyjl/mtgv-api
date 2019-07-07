import React from 'react';

class FinalizeEditionDisplay extends React.Component {

  render() {
    const {cardName, data} = this.props;
    const version = data.version;
    const frontImage = data.image[0];

    return (
      <div>
        <li>
          <div className="editionContainer">
            <div className="editionImage">
              <img src={frontImage} alt={cardName + version} />
            </div>
            { data.image.length === 2 ? 
              <div className="editionImage">
                <img src={data.image[1]} alt={cardName + version} />
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