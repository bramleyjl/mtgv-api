import React, { Component } from "react";
import Button from "@material-ui/core/Button";

class ExportButton extends Component {
  render() {
    return (
      <Button
        variant="contained"
        color="secondary"
        type="submit"
        form="versionSelect"
      >
        Export
      </Button>
    );
  }
}
export default ExportButton;
