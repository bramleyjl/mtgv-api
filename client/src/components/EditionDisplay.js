import React from 'react';

class EditionDisplay extends React.Component {

  render() {

    const { cardName, data, onClick } = this.props;
    const version = data[1];
    const frontImage = data[2][0];
    if (data[3] != undefined) {
      var price = 'Normal ' + data[4].normal;
      var foilPrice = ''
      if (data[4].foil != null) foilPrice = 'Foil ' + data[4].foil;
    } else {
      var price = 'Normal ???';
      var foilPrice = 'Foil ???';
    }

    return (
      <div>
        <div className="editionCaption">{version}</div>
        <div>{price}</div>
        <div>{foilPrice}</div>
        <li onClick={onClick}>
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

export default EditionDisplay;