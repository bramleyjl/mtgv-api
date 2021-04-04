import React from "react";
import Button from "@material-ui/core/Button";

class CardListActionButtons extends React.Component {
  render() {
    const { cardList } = this.props;
    return (
      <div className="cardListActionButtons">
        {cardList ?
          null :
          <Button
            variant="contained"
            color="primary"
            onClick={this.props.getRandomCards}
          >
            Random Cards
          </Button>
        }
        {cardList ?
          <Button
            variant="contained"
            color="primary"
            type="submit"
            form="cardList"
          >
            Select
          </Button> :
          null
        }
        {cardList ?
          <Button
            variant="contained"
            color="primary"
            onClick={this.props.clearList}
          >
            Clear
          </Button> :
          null
        }
      </div>
    );
  }
}

export default CardListActionButtons;
