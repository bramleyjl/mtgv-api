import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import { getCachedData, setCachedData, sortVersions } from "../helpers/helper.js";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Fab from "@material-ui/core/Fab";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Zoom from "@material-ui/core/Zoom";
import SwitchComponent from './helpers/SwitchComponent';

import NavBar from "./navBar/NavBar";
import CardList from "./cardList/CardList";
import CardPlaceholders from './CardPlaceholders';
import InfoPopover from './InfoPopover'
import Loading from "./Loading";
import CardPages from "./CardPages";

const useStyles = makeStyles(theme => ({
  root: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  }
}));

function ScrollTop(props) {
  const { children } = props;
  const classes = useStyles();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = event => {
    const anchor = document.querySelector("#back-to-top-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
        {children}
      </div>
    </Zoom>
  );
}

ScrollTop.propTypes = {
  children: PropTypes.element.isRequired
};

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.clearList = this.clearList.bind(this);
    this.versionLookup = this.versionLookup.bind(this);
    this.changePage = this.changePage.bind(this);
    this.state = {
      cardList: getCachedData("cardList"),
      cardImages: JSON.parse(getCachedData('cardImages')) ?? [],
      currentPage: getCachedData("currentPage") ?? 0,
      pages: getCachedData("pages") != null ? JSON.parse(getCachedData("pages")) : [],
      activeComponent: 'placeholders',
      finalButtons: false,
      modalOpened: false
    };
  }

  componentDidMount() {
    if (this.state.pages.length > 0) {
      this.fetchPreviews(this.state.pages[this.state.currentPage], this.state.currentPage);
    }
  } 

  clearList() {
    this.setState({
      cardList: '',
      pages: [],
      cardImages: [],
      activeComponent: 'placeholders',
      finalButtons: false
    });
    setCachedData('cardList', '');
    setCachedData('currentPage', 0);
    setCachedData('pages', JSON.stringify([]));
    setCachedData('cardImages', JSON.stringify([]));
  }

  fetchPreviews = async (cardList, pageIndex) => {
    this.setState({
      finalButtons: false,
      activeComponent: 'loading',
      currentPage: pageIndex
    });
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
    let cardImages = this.state.cardImages;
    let sortedImages = sortVersions(body.cardImages, 'versionName');
    cardImages[pageIndex] = sortedImages;
    this.setState({
      cardImages: cardImages,
      activeComponent: 'cardPages',
      finalButtons: true,
    });
  };

  toggleModal = () => {
    this.setState(prevState => ({ modalOpened: !prevState.modalOpened }));
  }

  changePage = (cards, pageIndex) => {
    this.fetchPreviews(cards, pageIndex);
  }

  versionLookup = (cardList, pages, cardImages) => {
    this.setState({
      cardList: cardList,
      pages: pages,
      cardImages: cardImages,
    });
    setCachedData('cardList', cardList);
    setCachedData('pages', JSON.stringify(pages));
    setCachedData('cardImages', JSON.stringify(cardImages));
    this.fetchPreviews(pages[0], 0);
  };

  render() {
    return (
      <div>
        <NavBar
          toggleModal={this.toggleModal}
          finalButtons={this.state.finalButtons}
          cardImages={this.state.cardImages}
          pages={this.state.pages}
          currentPage={this.state.currentPage}
          cardList={this.state.cardList}
          changePage={this.changePage}
        />
        <InfoPopover
          open={this.state.modalOpened}
          toggleModal={this.toggleModal}  
        />
        <div id="back-to-top-anchor"></div>
        <Grid
          container
          justify="space-around"
          wrap="nowrap"
        >
          <Grid item xs={2} direction="column">
            <CardList
              cardList={this.state.cardList}
              clearList={this.clearList}
              versionLookup={this.versionLookup}
            />
          </Grid>
          <Grid item xs={10} direction="column">
            <SwitchComponent active={this.state.activeComponent}>
              <CardPlaceholders name="placeholders" />
              <Loading name="loading" />
              <CardPages
                name="cardPages"
                cardImages={this.state.cardImages}
                currentPage={this.state.currentPage}
              />
            </SwitchComponent>
          </Grid>
          <ScrollTop>
            <Fab color="secondary" size="small" aria-label="scroll back to top">
              <KeyboardArrowUpIcon />
            </Fab>
          </ScrollTop>
        </Grid>
      </div>
    );
  }
}

export default HomePage;
