import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import { getCachedData, setCachedData } from "../helpers/helper.js";

import NavBar from "./NavBar";
import CardList from "./CardList";
import CardPlaceholders from './CardPlaceholders';
import CardVersions from './CardVersions';


class HomePage extends Component {
  constructor(props) {
    super(props);
    this.clearList = this.clearList.bind(this);
    this.versionLookup = this.versionLookup.bind(this);
    this.state = {
      cardList: getCachedData("cardList"),
      cardImages: [],
      placeHolders: true,
      selectButton: false,
      loading: true
    };
  }

  componentDidMount() {
    if (this.state.cardList) {
      this.setState({ placeHolders: false });
      this.fetchPreviews(this.state.cardList);
    }
  }

  clearList() {
    this.setState({
      cardList: '',
      cardImages: [],
      placeHolders: true,
      selectButton: false,
      loading: true
    });
    setCachedData('cardList', '');
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
      placeHolders: false,
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
        <Grid container>
          <Grid item xs={4}>
            <CardList
              cardList={this.state.cardList}
              clearList={this.clearList}
              versionLookup={this.versionLookup}
            />
          </Grid>
          <Grid item xs={8}>
            {this.state.placeHolders ?
              <CardPlaceholders /> :
              <CardVersions 
                cardImages={this.state.cardImages}
                loading={this.state.loading}
                handleVersionSelect={this.handleVersionSelect}
              />
            }
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default HomePage;
