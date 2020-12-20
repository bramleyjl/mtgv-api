import React from "react";
import { render } from "react-dom";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import "typeface-roboto";
import "./css/index.css";
import Root from "./components/Root";
import registerServiceWorker from "./registerServiceWorker";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#66bb6a',
    },
    secondary: {
      main: '#651fff',
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
