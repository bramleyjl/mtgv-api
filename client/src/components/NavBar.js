import React, { Component } from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import ExportButton from "./ExportButton.js";

class NavBar extends Component {
  render() {
    return (
      <AppBar position="sticky">
        <Toolbar className="toolbar">
          <Button component={Link} to="/">
            MtG Versioner
          </Button>
          <Button component={Link} to="/about">
            About
          </Button>
          <Button href="https://github.com/bramleyjl/MTGVersioner">
            GitHub
          </Button>
          <div style={{ flex: 1 }}></div>
          {this.props.selectButton === true ?
            <ExportButton cardImages={this.props.cardImages} /> :
            null
          }
        </Toolbar>
      </AppBar>
    );
  }
}
export default NavBar;
