import React, { Component } from 'react';
import ScriptEntry from './ScriptEntry';

class HomePage extends Component {

// { %><%= scriptPreset %>
// "(Many cards only have a single printing, so don't be surprised to only see one version available.)"
// <% } %>

  constructor() {
    super();
    this.autofillText = this.autofillText.bind(this);
    this.state = {
      script : ''
    }
  }

  autofillText() {
    this.setState({ script: 
      'Magic: the Gathering has many cycles of five cards, one for each color. \
      One of the first examples of this is "three for one" cycle, which appears in the very first set, Alpha.\n\n\
      The most powerful entry in this cycle is undoubtedly [Ancestral Recall], a blue spell that draws three cards, \
      and is so strong that it is included in the fabled "Power Nine" list. \
      Next is the black [Dark Ritual], which gives you three black mana (for a net benefit of two mana) \
      and is a key component of many combo decks. Red receives the iconic [Lightning Bolt] that deals three damage to any target. \
      Aggressive decks use it to finish off low-health opponents and controlling decks love it to clear their opponents\' early threats.\n\n\
      Green and white received far less powerful cards in this cycle. \
      Green\'s [Giant Growth] gives any creature +3/+3 which has both offensive and defensive applications. \
      White\'s [Healing Salve] is substantially worse than even Giant Growth, and is widely considered to be unplayable in a competitive setting.'
    });
  }

  render() {
    return (
      <div className="container">
        <div class="row">
          <div class="twelve columns pageTitle">
            <a href="/"><h1>MtG Script Automater</h1></a>
          </div>
        </div>

        <div class="row">
          <div class="twelve columns blurb">
            <h5><a href="https://github.com/BColsey/MTGScriptAutomater">View this app on GitHub</a></h5>
            <p>MtG Script Automater parses text to allow you to quickly and easily download high quality images of as many Magic: the Gathering cards as you choose. 
            It was designed for <a href="https://www.youtube.com/user/TheManaSource">The Mana Source's</a> creator Wedge to expedite his script writing process. 
            Simply enter in whatever text you like with desired card names in <b>[square brackets]</b>, then click on the version you want to download to select it 
            (click it again if you wish to choose another version).</p>
          </div>
        </div>

        <div class="row">
          <div class="six columns">
            <div className="container">
            <form action="/imageSelect" method="POST">
              <label for="script">Script Entry</label>
              <textarea class="u-full-width" name="script" id="script" value={this.state.script} required placeholder="Enter card names in square brackets, e.g. [Birds of Paradise]" />
              <input type="submit" value="Select Versions" />
            </form>
            </div> 
          </div>

          <div class="six columns">
            <h5>Don't know any Magic cards?</h5>
            <a href="/randomCards"><button>Find some random cards!</button></a>
            <h5>Or grab some premade text &darr;</h5>
            <button onClick={this.autofillText}>Click to Copy/Paste</button>
          </div>
        </div>
      </div>       
    );
  }
}

export default HomePage;