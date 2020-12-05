import React from "react";
import Button from "@material-ui/core/Button";

class DownloadButton extends React.Component {
  render() {
    return (
      <div>
        <Button variant="contained" 
                color="secondary" 
                type="submit" 
        >
          Test Button Text
        </Button>
      </div>
    );
  }
}

export default DownloadButton;
