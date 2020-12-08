import React, { Component } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";

import CardLookup from "./CardLookup";

class CardList extends Component {
  constructor(props) {
    super(props);
    this.inputChange = this.inputChange.bind(this);
    this.handleSubmitCardList = this.handleSubmitCardList.bind(this);
    this.getRandomCards = this.getRandomCards.bind(this);
    this.state = {
      cardList: this.props.cardList
    }
  };

  getRandomCards = async (example) => {
    const config = {
      method: "GET",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
    };
    const response = await fetch(
      process.env.REACT_APP_URL + "/api/randomCards",
      config
    );
    const body = await response.json();
    this.setState({
      cardList: body.randomCards,
    });
  };

  handleSubmitCardList(event) {
    event.preventDefault();
    this.props.versionLookup(event.target.cardList.value);
  }

  handleSubmitCardLookup = value => {
    let cardList = this.state.cardList ? this.state.cardList + "\n" + value : value;
    this.setState({
      cardList: cardList
    });
  }

  inputChange(event) {
    event.preventDefault();
    var newValue = event.target.value;
    this.setState({
      cardList: newValue,
    });
  }

  render() {

    return (
      <div>
        <Grid container justify="space-around">
          <Grid item lg={6} md={8} sm={10} xs={12}>
            <div className="scriptEntry">
              <CardLookup 
                handleSubmitCardLookup={this.handleSubmitCardLookup}
              />
              <Paper elevation={3}>
                <form
                  id="versionSelect"
                  onSubmit={this.handleSubmitCardList.bind(this)}
                >
                  <TextField
                    id="cardList"
                    name="cardList"
                    multiline={true}
                    rows="10"
                    fullWidth={true}
                    value={this.state.cardList}
                    onChange={(e) => this.inputChange(e)}
                    required
                  />
                </form>
              </Paper>
              <Grid container justify="space-around">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={this.getRandomCards}
                >
                  Copy random cards
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  form="versionSelect"
                >
                  Select Versions
                </Button>
              </Grid>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default CardList;
