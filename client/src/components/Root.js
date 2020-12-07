import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import About from "./pages/About";
import FinalizedVersions from "./FinalizedVersions";
import HomePage from "./HomePage";
import VersionSelect from "./VersionSelect";

class Root extends Component {
  constructor(props) {
    super(props);
    this.handleInput = this.handleInput.bind(this);
    this.handleVersionSelect = this.handleVersionSelect.bind(this);
    this.state = {
      cardInput: "",
      versionSubmit: undefined,
    };
  }

  handleInput = (cardInput) => {
    this.setState({ cardInput: cardInput });
  };

  handleVersionSelect = (finalizedVersions) => {
    this.setState({
      finalizedVersions: finalizedVersions,
    });
  };

  render() {
    return (
      <BrowserRouter>
        <div>
          <Route exact path="/" render={(props) => (
            <HomePage {...props} versionLookup={this.handleInput} />
          )} />
          <Route exact path="/about" render={(props) => 
            <About />}
          />
          <Route path="/versionSelect" render={(props) => (
            <VersionSelect {...props} cardList={this.state.cardInput} handleVersionSelect={this.handleVersionSelect} />
          )} />
          <Route path="/finalizedVersions" render={(props) => (
            <FinalizedVersions {...props} cardList={this.state.cardInput} finalizedVersions={this.state.finalizedVersions} />
          )} />
        </div>
      </BrowserRouter>
    );
  }
}

export default Root;
