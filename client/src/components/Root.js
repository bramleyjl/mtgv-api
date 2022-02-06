import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";

class Root extends React.Component {

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage/>} exact />
        </Routes>
      </BrowserRouter>
    );
  }
}

export default Root;
