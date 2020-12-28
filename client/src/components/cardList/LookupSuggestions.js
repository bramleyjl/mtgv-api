import React from "react";
import Button from "@material-ui/core/Button";

class LookupSuggestions extends React.Component {
  render() {
    const { suggestions } = this.props;
    let suggestButtons = [];
    for (let i = 0; i < 3; i++) {
      if (suggestions[i]) {
        suggestButtons.push(
          <Button
            key={i}
            onClick={() => this.props.handleSubmitCardLookup(suggestions[i])}
          >
            {suggestions[i]}
          </Button>     
        );
      }
    }
    return (
      <div className="lookupSuggestions">
        {suggestButtons}
      </div>
    );
  }
}

export default LookupSuggestions;