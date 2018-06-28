import React, { Component } from 'react';

class HomePage extends Component {

// { %><%= scriptPreset %>
// "(Many cards only have a single printing, so don't be surprised to only see one version available.)"
// <% } %>

  constructor() {
    super();
    this.inputChange = this.inputChange.bind(this);
    this.handleSubmitScript = this.handleSubmitScript.bind(this);
    this.autofillText = this.autofillText.bind(this);
    this.getRandomCards = this.getRandomCards.bind(this);
    this.state = {
      script: undefined
    }
  }

  inputChange(event) {
    event.preventDefault();
    var newValue = event.target.value
    this.setState({
      script: newValue
    });
  }

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
    const response = await fetch('http://bramley.design:4000/api/randomCards', config);
    const body = await response.json();
    this.setState({
      script: body.randomCards
    });  
  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 pageTitle">
            <a href="/"><h1>MtG Script Automater</h1></a>
          </div>
        </div>

        <div className="row">
          <div className="col-12 blurb">
            <h5><a href="https://github.com/BColsey/MTGScriptAutomater">View this app on GitHub</a></h5>
            <p>MtG Script Automater parses text to allow you to quickly and easily download high quality images of as many Magic: the Gathering cards as you choose. 
            It was designed for <a href="https://www.youtube.com/user/TheManaSource">The Mana Source's</a> creator Wedge to expedite his script writing process. 
            Simply enter in whatever text you like with desired card names in <b>[square brackets]</b>, then click on the version you want to download to select it 
            (click it again if you wish to choose another version).</p>
          </div>
        </div>

        <div className="row">
          <div className="col-6">
              <form onSubmit={this.handleSubmitScript.bind(this)}  onChange={(e) => this.inputChange(e)}>
                <div className="form-group">
                  <label className="col-form-label-lg" htmlFor="script">Script Entry</label>
                  <textarea className="form-control" rows="10" name="script" id="script" value={this.state.script} required placeholder="Enter card names in square brackets, e.g. [Birds of Paradise]" />
                  <button>Select Versions</button>
                </div>
              </form>
          </div>

          <div className="col-6">
            <h5>Don't know any Magic cards?</h5>
            <button onClick={this.getRandomCards}>Find some random cards!</button>
            <h5>Or grab some premade text &darr;</h5>
            <button onClick={this.autofillText}>Click to Copy/Paste</button>
          </div>
        </div>
      </div>       
    );
  }
}

export default HomePage;