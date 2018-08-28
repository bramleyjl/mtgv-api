import React from 'react';

class EditionDisplay extends React.Component {

  render() {

    const { multiverse, cardName, data, onClick } = this.props;
    const version = data[1];
    const frontImage = data[2][0];

    return (
      <div>
        <div className="editionCaption">{version}</div>
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