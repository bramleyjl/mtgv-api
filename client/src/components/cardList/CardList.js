import React from "react";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import CardLookup from "./CardLookup";
import CardListActionButtons from "./CardListActionButtons";
import commander_list from '../../assets/commander_list.json';

class CardList extends React.Component {
  constructor(props) {
    super(props);
    this.clearList = this.clearList.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.handleSubmitCardList = this.handleSubmitCardList.bind(this);
    this.getCommanderList = this.getCommanderList.bind(this);
    this.getRandomCards = this.getRandomCards.bind(this);
    this.state = {
      cardList: this.props.cardList
    }
  };

  clearList() {
    this.setState({ cardList: '' });
    this.props.clearList();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.cardList !== this.props.cardList) {
      this.setState({
        cardList: this.props.cardList
      });
    }
  }

  getCommanderList() { this.setState({ cardList: commander_list['text'] }) };

  getRandomCards = async () => {
    const config = {
      method: "GET",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
    };
    const response = await fetch(process.env.REACT_APP_URL + "/api/randomCards", config);
    const body = await response.json();
    this.setState({ cardList: body.randomCards });
  };

  handleSubmitCardList(event) {
    event.preventDefault();
    this.props.versionLookup(event.target.cardList.value);
  }

  handleSubmitCardLookup = value => {
    const cardList = this.state.cardList ? this.state.cardList + "\n" + value : value;
    this.setState({
      cardList: cardList
    });
  }

  inputChange(event) {
    event.preventDefault();
    this.setState({
      cardList: event.target.value,
    });
  }

  render() {
    return (
      <div className="cardList" style={{position: 'fixed'}}>
        <CardLookup 
          handleSubmitCardLookup={this.handleSubmitCardLookup}
        />
        <Paper elevation={3}>
          <form
            id="cardList"
            onSubmit={this.handleSubmitCardList.bind(this)}
          >
            <TextField
              id="cardList"
              name="cardList"
              multiline={true}
              minRows="15"
              fullWidth={true}
              value={this.state.cardList}
              onChange={(e) => this.inputChange(e)}
              required
            />
          </form>
        </Paper>
        <CardListActionButtons
          cardList={ this.state.cardList }
          clearList={ this.clearList }
          getRandomCards={ this.getRandomCards }
          getCommanderList= { this.getCommanderList }
        />
      </div>
    );
  }
}

export default CardList;
