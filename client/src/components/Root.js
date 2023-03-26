import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";

class Root extends React.Component {

  render() {
    return (
        <>
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </>
    );
  }
}

export default Root;
