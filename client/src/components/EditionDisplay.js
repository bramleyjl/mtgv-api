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
   		<img src={link} alt={cardName + edition} />
    </li>
    </div>
    )
  }
}

export default EditionDisplay;