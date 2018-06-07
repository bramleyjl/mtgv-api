import React, { Component } from 'react';

class ScriptEntry extends Component {

  constructor() {
    super();
    this.script = ""
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
      <form action="/imageSelect" method="POST">
        <label for="script">Script Entry</label>
        <textarea class="u-full-width" name="script" id="script" value={this.script} required placeholder="Enter card names in square brackets, e.g. [Birds of Paradise]" />
        <input type="submit" value="Select Versions" />
      </form>
      </div>       
    );
  }
}

export default ScriptEntry;