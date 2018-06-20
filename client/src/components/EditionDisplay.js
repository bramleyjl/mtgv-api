import React from 'react';

class EditionDisplay extends React.Component {

  render() {

     const { edition } = this.props;
     const { cardName } = this.props;
     const { link } = this.props;
     const { onClick } = this.props;

    return (
   	<div>
     	<li onClick={onClick}>
     		<p>{edition}</p>
     		<img src={link[0]} alt={cardName + edition} />
        { link.length === 2 ? <img src={link[1]} alt={cardName + edition} /> : null }
      </li>
    </div>
    )
  }
}

export default EditionDisplay;