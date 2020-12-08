import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import { getCachedData, setCachedData } from "../helpers/helper.js";

import NavBar from "./NavBar";
import CardList from "./CardList";
import Loading from "./Loading";
import VersionSelect from "./VersionSelect";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.versionLookup = this.versionLookup.bind(this);
    this.state = {
      cardList: getCachedData("cardList"),
      cardImages: [],
      selectButton: false,
      loading: true
    };
  }

  componentDidMount() {
    if (this.state.cardList) {
      this.fetchPreviews(this.state.cardList);
    }
  }

  fetchPreviews = async (cardList) => {
    const config = {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        cardList: cardList,
      }),
    };
    const response = await fetch(
      process.env.REACT_APP_URL + "/api/VersionSelect",
      config
    );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    if (body.userAlert !== "") {
      window.alert(body.userAlert);
    }
    this.setState({
      cardList: cardList,
      cardImages: body.cardImages,
      selectButton: true,
      loading: false,
    });
  };

  versionLookup = (cardList) => {
    this.setState({
      cardList: cardList,
      cardImages: [],
      selectButton: false,
      loading: true
    });
    setCachedData('cardList', cardList);
    this.fetchPreviews(cardList);
  };

  render() {

    return (
      <div>
        <NavBar selectButton={this.state.selectButton} />
        <Grid container>
          <Grid item xs={12}>
            <h1 className="pageTitle">MtG Versioner</h1>
          </Grid>
        </Grid>
        <CardList cardList={this.state.cardList} versionLookup={this.versionLookup} />
        {this.state.loading ?
            <Loading loading={this.state.loading} /> :
            <VersionSelect
            cardImages={this.state.cardImages}
            loading={this.state.loading}
            handleVersionSelect={this.handleVersionSelect}
          />          
        }
      </div>
    );
  }
}

export default HomePage;
