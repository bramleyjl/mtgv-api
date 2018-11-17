import React, { Component } from 'react';
import NavBar from './NavBar';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


class HomePage extends Component {

  constructor() {
    super();
    this.inputChange = this.inputChange.bind(this);
    this.handleSubmitCardLookup = this.handleSubmitCardLookup.bind(this);
    this.handleSubmitCardList = this.handleSubmitCardList.bind(this);
    this.getRandomCards = this.getRandomCards.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      cardList: undefined,
      open: false
    }
  }

  inputChange(event) {
    event.preventDefault();
    var newValue = event.target.value
    this.setState({
      cardList: newValue
    });
  }

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  handleSubmitCardLookup(event) {
    event.preventDefault();

    //check for card count/'x' values in front of card name
    var card = event.target.cardLookup.value;
    var cardCount = card.match(/\d+[\sxX\s]*/);
    if (cardCount === null) { cardCount = 1 };
    cardCount = String(cardCount).replace(/\s*\D\s*/, '');
    card = card.replace(/\d+[\sxX\s]*/, '');
    card = cardCount + ' ' + card;

    var cardList = '';
    this.state.cardList ? cardList = this.state.cardList + '\n' : cardList = '';
    this.setState({
      cardList: cardList + card
    });
    event.target.cardLookup.value = '';
  }

  handleSubmitCardList(event) {
    event.preventDefault();
    const submittedCardList = event.target.cardList.value;
    this.props.checkScript(submittedCardList);
    this.props.history.push('/imageSelect');
  }

  getRandomCards = async(example) => {
    const config = {
      method: 'GET',
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    }
    const response = await fetch(process.env.REACT_APP_URL + '/api/randomCards', config);
    const body = await response.json();
    this.setState({
      cardList: body.randomCards
    });  
  };

  render() {
    return (
    <div>

      <NavBar />

      <Grid container>
        <Grid item xs={12}>
          <h1 className="pageTitle">MtG Versioner</h1>
        </Grid>
      </Grid>

      <Grid container justify="space-around">
        <Grid item lg={6} md={8} sm={10} xs={12}>
        <div className="scriptEntry">
          <Paper elevation={3}>
            <form id="cardLookup" onSubmit={this.handleSubmitCardLookup.bind(this)}>
                <TextField id="cardFinder" name="cardLookup" label="Card Finder"/>
            </form>
          </Paper>
          <Paper elevation={3}>            
            <form id="imageSelect" onSubmit={this.handleSubmitCardList.bind(this)}>
                <TextField id="cardList" name="cardList" multiline={true} rows="10" fullWidth={true} value={this.state.cardList} onChange={(e) => this.inputChange(e)} required/>
            </form>
          </Paper>
          <Grid container justify="space-around">
            <Button variant="contained" color="secondary" onClick={this.getRandomCards}>Copy random cards</Button>
            <Button variant="contained" color="primary" type="submit" form="imageSelect">Select Versions</Button>
          </Grid>
          </div>
        </Grid>
      </Grid>       


    </div>
    );
  }
}

export default HomePage;