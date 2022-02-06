import React from "react";
import InputPredict from "react-inline-predict";
import LookupSuggestions from "./LookupSuggestions";
import cardNamesData from "../../assets/cardNames.json";

class CardLookup extends React.Component {
  constructor() {
    super();
    this.binarySearch = this.binarySearch.bind(this);
    this.handleLookupChange = this.handleLookupChange.bind(this);
    this.handleSubmitCardLookup = this.handleSubmitCardLookup.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.cardLookup = React.createRef();
    this.state = {
      cardSuggestions: []
    };
  };

  binarySearch(needle, list) {
    var sampleIndex = parseInt(list.length / 2, 10);
    var sample = list[sampleIndex];
    var normalizedSample = sample.toLowerCase();
    if (normalizedSample.indexOf(needle) === 0) {
      var suggestions = [sample];
      for (var i = 1; i < 4; i++) {
        if (list[sampleIndex - i]) {
          var aheadSample = list[sampleIndex - i];
          var normalizedAhead = aheadSample.toLowerCase();
          if (normalizedAhead.indexOf(needle) === 0) {
            suggestions.unshift(aheadSample);
          }
        }
        if (list[sampleIndex + i]) {
          var behindSample = list[sampleIndex + i];
          var normalizedBehind = behindSample.toLowerCase();
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

  handleLookupChange(event) {
    if (event.keyCode === 13) {
      return;
    }
    let value = event.target.value;
    let cardName = value.replace(/\d+[\sxX\s]*/, "");    
    const needle = cardName.toLowerCase();
    if (needle.length >= 3) {
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
    this.cardLookup.current.state.value = '';
    this.setState({
      cardSuggestions: []
    });
  }

  onKeyDown(event) {
    if (event.keyCode !== 13) {
      return;
    }
    let value = event.target.value;
    this.handleSubmitCardLookup(value);
  }

  render() {
    return (
      <div>
        <LookupSuggestions
          suggestions={this.state.cardSuggestions}
          handleSubmitCardLookup={this.handleSubmitCardLookup}
        />
        <InputPredict
          type="text"
          ref={this.cardLookup}
          placeholder="card name"
          size="30"
          onKeyUp={this.handleLookupChange}
          onKeyDown={this.onKeyDown}
        />
      </div>
    );
  }
}

export default CardLookup;