import React from "react";
import { BrowserRouter, Route } from "react-router-dom";

import About from "./pages/About";
import HomePage from "./HomePage";

class Root extends React.Component {

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
        </div>
      </BrowserRouter>
    );
  }
}

export default Root;
