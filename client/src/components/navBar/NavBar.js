import React, { Component } from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import ExportButton from "./ExportButton.js";
import PurchaseButton from "./PurchaseButton.js";

class NavBar extends Component {
  render() {
    let finalButtons = this.props.finalButtons;
    let toggleModal = this.props.toggleModal;
    let cardImages = this.props.cardImages;
    let pages = this.props.pages;
    let currentPage = parseInt(this.props.currentPage);
    let pageBehind = pages[currentPage - 1];
    let lastPageButton = pageBehind != undefined ? 
      <Button variant="contained" color="secondary" onClick={this.props.changePage.bind(this, pageBehind, currentPage - 1)}>
        Previous Page
      </Button> : null;
    let pageAhead = pages[currentPage + 1];
    let nextPageButton = pageAhead != undefined ? 
      <Button variant="contained" color="secondary"  onClick={this.props.changePage.bind(this, pageAhead, currentPage + 1)}>
        Next Page
      </Button> : null;
    
    return (
      <AppBar position="sticky">
        <Toolbar>
          <Button variant="contained" color="secondary" onClick={toggleModal}>
            MtG Versioner
          </Button>
          <div style={{ flex: 1 }}></div>
          {finalButtons === true ?
            <div>
              {lastPageButton}
              {nextPageButton}
              <PurchaseButton cardImages={cardImages} />
              <ExportButton cardImages={cardImages} />
            </div> : null
          }
        </Toolbar>
      </AppBar>
    );
  }
}
export default NavBar;
