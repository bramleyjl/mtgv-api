import React from "react";
import { render } from "react-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import "typeface-roboto";
import "./css/index.css";
import Root from "./components/Root";
import registerServiceWorker from "./registerServiceWorker";

import green from '@material-ui/core/colors/green';
import orange from '@material-ui/core/colors/orange';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: green[600],
    },
    secondary: {
      main: orange[400],
    },
  },
});

const App = () => {
  return (
    <MuiThemeProvider theme={theme}>
      <Root />
    </MuiThemeProvider>
  );
};

render(<App />, document.querySelector("#app"));
registerServiceWorker();
