import React from 'react';
import FinalizeEditionDisplay from './FinalizeEditionDisplay';

class FinalizeCardGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      liveImages: {},
    }
  }

  componentDidMount() {
    var versionId = Object.keys(this.props.details)[0].toString();
    var versionDisplay = {};
    versionDisplay[versionId] = Object.values(this.props.details)[0];
    this.setState({
      liveImages: versionDisplay
    });
  }

  render() {
    var cardName = Object.values(this.props.details)[0].name.join(' // ');
    var cardCount = Object.values(this.props.details)[1];
    var totalCards = [];
    for (var i = cardCount - 1; i >= 0; i--) {
      totalCards.push(
        Object
          .keys(this.state.liveImages)
          .map(key =>
            <FinalizeEditionDisplay 
              key={key} 
              multiverse={key} 
              cardName={cardName} 
              data={this.state.liveImages[key]}
              count={cardCount}
            />                  
          )
      );
    }
    return (
      <li className="cardName">
      <h5>{cardName} ({cardCount})</h5>
        <ul className="versionDisplay">
          {totalCards}
        </ul>
      </li>
    )
  }
}

export default FinalizeCardGroup;