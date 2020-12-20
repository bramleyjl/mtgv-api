import React from "react";
import Button from "@material-ui/core/Button";

class LookupSuggestions extends React.Component {
  render() {
    const { suggestions } = this.props;
    return (
      <div>
        {suggestions[0] ?
          <Button>{suggestions[0]}</Button> : null
        }
        {suggestions[1] ?
          <Button>{suggestions[1]}</Button> : null
        }
        {suggestions[2] ?
          <Button>{suggestions[2]}</Button> : null
        }
      </div>
    );
  }
}

export default LookupSuggestions;