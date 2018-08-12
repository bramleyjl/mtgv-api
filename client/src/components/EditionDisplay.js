import React from 'react';

class EditionDisplay extends React.Component {

  render() {

    const { edition, cardName, link, onClick } = this.props;
    return (
      <div>
        <div className="editionCaption">{edition}</div>
        <li className="editionFlex" onClick={onClick}>
          <div className="editionImage">
            <img src={link[0][0]} alt={cardName + edition} />
          </div>
          { link[0].length === 2 ? 
            <div className="editionImage">
              <img src={link[0][1]} alt={cardName + edition} />
            </div> 
            : null 
          }
        </li>
      </div>
    )
  }
}

export default EditionDisplay;