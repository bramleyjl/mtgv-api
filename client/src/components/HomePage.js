import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import { getCachedData, setCachedData, sortVersions } from "../helpers/helper.js";

import NavBar from "./navBar/NavBar";
import CardList from "./cardList/CardList";
import CardPlaceholders from './CardPlaceholders';
import VersionSelect from "./VersionSelect";

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.clearList = this.clearList.bind(this);
    this.versionLookup = this.versionLookup.bind(this);
    this.state = {
      cardList: getCachedData("cardList"),
      cardImages: [],
      cardPlaceHolders: true,
      finalButtons: false,
      loading: true
    };
  }

  componentDidMount() {
    if (this.state.cardList) {
      this.setState({ cardPlaceHolders: false });
      this.fetchPreviews(this.state.cardList);
    }
  } 

  clearList() {
    this.setState({
      cardList: '',
      cardImages: [],
      cardPlaceHolders: true,
      finalButtons: false
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
    let sortedImages = sortVersions(body.cardImages, 'versionName');
    this.setState({
      cardList: cardList,
      cardImages: sortedImages,
      finalButtons: true,
      loading: false,
    });
  };

  versionLookup = (cardList) => {
    this.setState({
      cardList: cardList,
      cardImages: [],
      finalButtons: false,
      cardPlaceHolders: false,
      loading: true
    });
    setCachedData('cardList', cardList);
    this.fetchPreviews(cardList);
  };

  render() {
    return (
      <div>
        <NavBar
          finalButtons={this.state.finalButtons}
          cardImages={this.state.cardImages}
        />
        <Grid container>
          <Grid item xs={4}>
            <CardList
              cardList={this.state.cardList}
              clearList={this.clearList}
              versionLookup={this.versionLookup}
            />
          </Grid>
          <Grid item xs={8}>
            {this.state.cardPlaceHolders ?
              <CardPlaceholders /> :
              <VersionSelect 
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
