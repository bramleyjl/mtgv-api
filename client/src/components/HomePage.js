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
    this.handleSubmitScript = this.handleSubmitScript.bind(this);
    this.autofillText = this.autofillText.bind(this);
    this.getRandomCards = this.getRandomCards.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      script: undefined,
      open: false
    }
  }

  inputChange(event) {
    event.preventDefault();
    var newValue = event.target.value
    this.setState({
      script: newValue
    });
  }

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  };

  handleSubmitScript(event) {
    event.preventDefault();
    const submittedScript = event.target.script.value;
    this.props.checkScript(submittedScript);
    this.props.history.push('/imageSelect');
  }

  autofillText() {
    this.setState({ script: 
      "Magic: the Gathering has many cycles of five cards, one for each color. " +
      "One of the first examples of this is 'three for one' cycle, which appears in the very first set, Alpha.\n\n" +
      "The most powerful entry in this cycle is undoubtedly [Ancestral Recall], a blue spell that draws three cards, " +
      "and is so strong that it is included in the fabled 'Power Nine' list. " +
      "Next is the black [Dark Ritual], which gives you three black mana (for a net benefit of two mana) " +
      "and is a key component of many combo decks. Red receives the iconic [Lightning Bolt] that deals three damage to any target. " +
      "Aggressive decks use it to finish off low-health opponents and controlling decks love it to clear their opponents' early threats.\n\n" +
      "Green and white received far less powerful cards in this cycle. " +
      "Green's [Giant Growth] gives any creature +3/+3 which has both offensive and defensive applications. " +
      "White's [Healing Salve] is substantially worse than even Giant Growth, and is widely considered to be unplayable in a competitive setting. "
    });
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
      script: body.randomCards
    });  
  };

  render() {
    return (
    <div>

      <NavBar />

      <Grid container>
        <Grid item xs={12}>
          <h1 className="pageTitle">MtG Script Automater</h1>
        </Grid>
      </Grid>
        
      <Grid container justify="space-around">
        <Grid item lg={4} md={5} sm={8} xs={12}> 
         <List>
          <ListItem style={{'textAlign': 'center', 'maxWidth': '400px', 'margin': 'auto'}}>
            <Avatar>
              <i className="ms ms-1"></i>
            </Avatar>
            <ListItemText
              disableTypography
              primary={<Typography variant="title" style={{ color: '#f0f0f0' }}>Enter Text</Typography>}
              secondary={<Typography variant="subheading" style={{ color: '#f0f0f0' }}>Card names in [square brackets]</Typography>}
            />
          </ListItem>
          <ListItem style={{'textAlign': 'center', 'maxWidth': '400px', 'margin': 'auto'}}>
            <Avatar>
              <i className="ms ms-2"></i>
            </Avatar>
            <ListItemText
              disableTypography
              primary={<Typography variant="title" style={{ color: '#f0f0f0' }}>Select Editions</Typography>}
              secondary={<Typography variant="subheading" style={{ color: '#f0f0f0' }}>Click to select, click again to unselect</Typography>}
            />            
          </ListItem>
          <ListItem style={{'textAlign': 'center', 'maxWidth': '400px', 'margin': 'auto'}}>
            <Avatar>
              <i className="ms ms-3"></i>
            </Avatar>
            <ListItemText
              disableTypography
              primary={<Typography variant="title" style={{ color: '#f0f0f0' }}>Download Images</Typography>}
              secondary={<Typography variant="subheading" style={{ color: '#f0f0f0' }}>Annotated script + PNGs</Typography>}
            />            
          </ListItem>          
         </List>
        </Grid>
      </Grid>

      <Grid container justify="space-around">
        <Grid item lg={6} md={8} sm={10} xs={12}>
        <div className="scriptEntry">
          <Paper elevation={3}>
            <form id="imageSelect" onSubmit={this.handleSubmitScript.bind(this)} onChange={(e) => this.inputChange(e)}>
                <TextField multiline={true} rows="12" fullWidth={true} name="script" id="script" value={this.state.script} required placeholder="Enter card names in square brackets, e.g. [Birds of Paradise]" />
            </form>
          </Paper>
          <Grid container justify="space-around">
            <Button variant="contained" color="secondary" onClick={this.getRandomCards}>Copy random cards</Button>
            <Button variant="contained" color="secondary" onClick={this.autofillText}>Copy premade text</Button>
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