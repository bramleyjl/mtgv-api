import React from 'react';

class EditionDisplay extends React.Component {

  render() {

    const { edition, cardName, link, onClick } = this.props;

    return (
      <div>
        <li onClick={onClick}>
          <div className="editionCaption">{edition}</div>
          <div className="editionImage">
            <img src={link[0]} alt={cardName + edition} />
            { link.length === 2 ? <img src={link[1]} alt={cardName + edition} /> : null }
          </div>
        </li>
      </div>
    )
  }
}

export default EditionDisplay;