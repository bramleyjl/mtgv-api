import React, { Component } from "react";
import NavBar from "./NavBar";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";

import InputPredict from "react-inline-predict";
import * as cardNamesData from "../assets/cardNames.json";

class HomePage extends Component {
  constructor() {
    super();
    this.inputChange = this.inputChange.bind(this);
    this.handleLookupChange = this.handleLookupChange.bind(this);
    this.handleSubmitCardLookup = this.handleSubmitCardLookup.bind(this);
    this.handleSubmitCardList = this.handleSubmitCardList.bind(this);
    this.getRandomCards = this.getRandomCards.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      cardList: undefined,
      open: false,
      cardSuggestions: [],
    };
  }

  inputChange(event) {
    event.preventDefault();
    var newValue = event.target.value;
    this.setState({
      cardList: newValue,
    });
  }

  handleClick = () => {
    this.setState((state) => ({ open: !state.open }));
  };

  binarySearch(needle, list) {
    var sampleIndex = parseInt(list.length / 2);
    var sample = list[sampleIndex];
    const normalizeRegEx = /[^a-zA-z\s]/g;
    var normalizedSample = sample.replace(normalizeRegEx, "").toLowerCase();
    if (normalizedSample.indexOf(needle) === 0) {
      var suggestions = [sample];
      for (var i = 1; i < 4; i++) {
        if (list[sampleIndex - i]) {
          var aheadSample = list[sampleIndex - i];
          var normalizedAhead = aheadSample
            .replace(normalizeRegEx, "")
            .toLowerCase();
          if (normalizedAhead.indexOf(needle) === 0) {
            suggestions.unshift(aheadSample);
          }
        }
        if (list[sampleIndex + i]) {
          var behindSample = list[sampleIndex + i];
          var normalizedBehind = behindSample
            .replace(normalizeRegEx, "")
            .toLowerCase();
          if (normalizedBehind.indexOf(needle) === 0) {
            suggestions.push(behindSample);
          }
        }
      }
      return suggestions;
    } else if (list.length < 2) {
      return [];
    } else {
      var sorted = [needle, normalizedSample].sort();
      if (sorted[0] === needle) {
        var start = 0;
        var end = sampleIndex;
      } else {
        var start = sampleIndex + 1;
        var end = list.length + 1;
      }
      var newList = list.length === 2 ? [list[0]] : list.slice(start, end);
      return this.binarySearch(needle, newList);
    }
  }

  handleLookupChange(value, match) {
    const normalizeRegEx = /[^a-zA-z\s]/g;
    var needle = value.replace(normalizeRegEx, "").toLowerCase();
    if (value.length >= 3) {
      var namesList = cardNamesData["data"];
      var suggestions = this.binarySearch(needle, namesList);
      this.setState({
        cardSuggestions: suggestions,
      });
    }
  }

  handleSubmitCardLookup(event) {
    event.preventDefault();
    //check for card count/'x' values in front of card name
    var card = event.target.cardLookup.value;

    var cardCount = card.match(/\d+[\sxX\s]*/);
    if (cardCount === null) {
      cardCount = 1;
    }
    cardCount = String(cardCount).replace(/\s*\D\s*/, "");
    card = card.replace(/\d+[\sxX\s]*/, "");
    card = cardCount + " " + card;

    var cardList = "";
    this.state.cardList
      ? (cardList = this.state.cardList + "\n")
      : (cardList = "");
    this.setState({
      cardList: cardList + card,
    });
    event.target.cardLookup.value = "";
  }

  handleSubmitCardList(event) {
    event.preventDefault();
    const submittedCardList = event.target.cardList.value;
    this.props.checkScript(submittedCardList);
    this.props.history.push("/imageSelect");
  }

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

  render() {
    var cardNames = cardNamesData["data"];

    return (
      <div>
        <NavBar />

        <Grid container>
          <Grid item xs={12}>
            <h1 className="pageTitle">MtG Versioner</h1>
          </Grid>
        </Grid>

        <Grid container justify="space-around">
          <Grid item lg={6} md={8} sm={10} xs={12}>
            <div className="scriptEntry">
              <Paper elevation={3}>
                <div>
                  {this.state.cardSuggestions.map((name) => (
                    <span key={name}>{name}</span>
                  ))}
                </div>

                <form
                  id="cardLookup"
                  onSubmit={this.handleSubmitCardLookup.bind(this)}
                >
                  <InputPredict
                    type="text"
                    name="name"
                    placeholder="card name"
                    onValueChange={this.handleLookupChange}
                    dictionary={cardNames}
                  />
                </form>
              </Paper>
              <Paper elevation={3}>
                <form
                  id="imageSelect"
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
                  form="imageSelect"
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

export default HomePage;
