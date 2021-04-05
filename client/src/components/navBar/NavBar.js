import React, { Component } from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import ExportButton from "./ExportButton.js";
import PurchaseButton from "./PurchaseButton.js";

class NavBar extends Component {
  render() {
    return (
      <AppBar position="sticky">
        <Toolbar>
          <Button variant="contained" color="secondary" onClick={this.props.toggleModal}>
            MtG Versioner
          </Button>
          <div style={{ flex: 1 }}></div>
          {this.props.finalButtons === true ?
            <div>
              <PurchaseButton cardImages={this.props.cardImages} />
              <ExportButton cardImages={this.props.cardImages} />
            </div> :
            null
          }
        </Toolbar>
      </AppBar>
    );
  }
}
export default NavBar;
