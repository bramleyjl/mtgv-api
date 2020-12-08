import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import About from "./pages/About";
import FinalizedVersions from "./FinalizedVersions";
import HomePage from "./HomePage";

class Root extends Component {
  constructor(props) {
    super(props);
    this.handleVersionSelect = this.handleVersionSelect.bind(this);
    this.state = {
      versionSubmit: undefined,
    };
  }

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
            <HomePage />
          )} />
          <Route exact path="/about" render={(props) => 
            <About />}
          />
          <Route path="/finalizedVersions" render={(props) => (
            <FinalizedVersions {...props} cardList={this.state.cardInput} finalizedVersions={this.state.finalizedVersions} />
          )} />
        </div>
      </BrowserRouter>
    );
  }
}

export default Root;
