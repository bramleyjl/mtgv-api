import React from "react";
import InputPredict from "react-inline-predict";
import Paper from "@material-ui/core/Paper";
import * as cardNamesData from "../../assets/cardNames.json";

class CardLookup extends React.Component {
  constructor() {
    super();
    this.binarySearch = this.binarySearch.bind(this);
    this.handleLookupChange = this.handleLookupChange.bind(this);
    this.handleSubmitCardLookup = this.handleSubmitCardLookup.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.state = {
      cardSuggestions: []
    };
  };

  binarySearch(needle, list) {
    var sampleIndex = parseInt(list.length / 2, 10);
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
      var start = sampleIndex + 1;
      var end = list.length + 1;
      if (sorted[0] === needle) {
        start = 0;
        end = sampleIndex;
      }
      var newList = list.length === 2 ? [list[0]] : list.slice(start, end);
      return this.binarySearch(needle, newList);
    }
  }

  handleLookupChange(value) {
    let cardName = value.replace(/\d+[\sxX\s]*/, "");    
    const normalizeRegEx = /[^a-zA-z\s]/g;
    const needle = cardName.replace(normalizeRegEx, "").toLowerCase();
    if (value.length >= 3) {
      let suggestions = this.binarySearch(needle, cardNamesData["data"]);
      this.setState({
        cardSuggestions: suggestions,
      });
    }
  }

  handleSubmitCardLookup(value) {
    let cardCount = value.match(/\d+[\sxX\s]*/);
    if (cardCount === null) {
      cardCount = 1;
    }
    cardCount = String(cardCount).replace(/\s*\D\s*/, "");
    let card = value.replace(/\d+[\sxX\s]*/, "");
    card = cardCount + " " + card;

    this.props.handleSubmitCardLookup(card);
    this.setState({
      cardSuggestions: []
    });
  }

  onKeyDown(event) {
    let value = event.target.value;
    if (event.keyCode === 13) {
      this.handleSubmitCardLookup(value);
    } else {
      this.handleLookupChange(value);
    }
  }

  render() {
    return (
      <div>
        <Paper elevation={3}>
          <div>
            {this.state.cardSuggestions.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
              <InputPredict
                type="text"
                name="name"
                placeholder="card name"
                onKeyDown={this.onKeyDown}
              />
        </Paper>
      </div>
    );
  }
}

export default CardLookup;