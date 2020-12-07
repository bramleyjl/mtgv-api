import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import CardList from "./CardList";
import NavBar from "./NavBar";


class HomePage extends Component {
  constructor() {
    super();
    this.state = {
      cardList: undefined,
      open: false,
      cardSuggestions: [],
    };
  }

  render() {
    return (
      <div>
        <NavBar />
        <Grid container>
          <Grid item xs={12}>
            <h1 className="pageTitle">MtG Versioner</h1>
          </Grid>
        </Grid>
        <CardList />
      </div>
    );
  }
}

export default HomePage;
