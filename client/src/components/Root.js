import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import HomePage from "./HomePage";

class Root extends React.Component {

  render() {
    return (
      <BrowserRouter>
        <div>
          <Route exact path="/" render={(props) => (
            <HomePage />
          )} />
        </div>
      </BrowserRouter>
    );
  }
}

export default Root;
