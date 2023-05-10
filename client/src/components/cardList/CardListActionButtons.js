import React from "react";
import Button from "@material-ui/core/Button";

class CardListActionButtons extends React.Component {
  render() {
    const { cardList } = this.props;
    return (
      <div className="cardListActionButtons">
        { cardList ? null : <Button variant="contained" onClick={ this.props.getRandomCards }> Random Cards </Button> }
        { cardList ? null : <Button variant="contained" onClick={ this.props.getCommanderList }> Commander List </Button> }
        { cardList ? <Button variant="contained" type="submit" form="cardList"> Select </Button> : null }
        {cardList ? <Button variant="contained" onClick={ this.props.clearList }> Clear </Button> : null }
      </div>
    );
  }
}

export default CardListActionButtons;
