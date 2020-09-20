import React from "react";
import CardDisplay from "./CardDisplay";

class FinalCardGroup extends React.Component {
  constructor(props) {
    super(props);
    var details = Object.values(this.props.details)[0];
    var count = Object.values(this.props.details)[1];
    this.state = {
      details: details,
      cardCount: count,
    };
  }

  render() {
    var cards = [];
    for (var i = this.state.cardCount; i > 0; i--) {
      cards.push(
        <CardDisplay
          key={i}
          cardName={this.state.details.name[0]}
          final={true}
          data={this.state.details}
        />
      );
    }

    return (
      <li className="cardName">
        <ul className="versionDisplay">{cards}</ul>
      </li>
    );
  }
}

export default FinalCardGroup;
