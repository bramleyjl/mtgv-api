import React from "react";
import CardDisplay from "./CardDisplay";

class FinalCardGroup extends React.Component {
  constructor(props) {
    super(props);
    var cardInfo = Object.values(this.props.cardInfo)[0];
    var count = this.props.cardInfo.count;
    this.state = {
      cardInfo: cardInfo,
      cardCount: count,
    };
  }

  render() {
    var cardName = this.state.cardInfo.name[0];
    cardName += this.state.cardInfo.name[1]
      ? " // " + this.state.cardInfo.name[1]
      : "";

    var cards = [];
    for (var i = 1; i <= this.state.cardCount; i++) {
      cards.push(
        <CardDisplay key={i} final={true} data={this.state.cardInfo} />
      );
    }

    return (
      <li className="cardName">
        <h5>
          {cardName} x{this.state.cardCount}
        </h5>
        <ul className="versionDisplay">{cards}</ul>
      </li>
    );
  }
}

export default FinalCardGroup;
