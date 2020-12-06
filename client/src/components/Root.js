import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import HomePage from "./HomePage";
import About from "./pages/About";
import VersionSelect from "./VersionSelect";
import FinalizedVersions from "./FinalizedVersions";

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

  handleInput = (scriptValue) => {
    this.setState({ cardInput: scriptValue });
  };

  handleVersionSelect = (versionSubmit) => {
    this.setState({
      versionSubmit: versionSubmit,
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
            <FinalizedVersions {...props} cardList={this.state.cardInput} versions={this.state.versionSubmit} />
          )} />
        </div>
      </BrowserRouter>
    );
  }
}

export default Root;
