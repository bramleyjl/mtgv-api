import React from "react";
import SelectEditionDisplay from "./SelectEditionDisplay";

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
        <SelectEditionDisplay
          key={i}
          cardName={this.state.details.name[0]}
          data={this.state.details}
        />
      );
    }

    return (
      <li className="cardName">
        <h5>
          {this.state.details.name[0]} ({this.state.cardCount})
        </h5>
        <ul className="versionDisplay">{cards}</ul>
      </li>
    );
  }
}

export default FinalCardGroup;
