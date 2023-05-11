import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MuiThemeProvider, createTheme } from "@material-ui/core/styles";

import "typeface-roboto";
import "./css/index.css";
import Root from "./components/Root";
import registerServiceWorker from "./registerServiceWorker";

const theme = createTheme({
  palette: {
    primary: {
      main: '#b1b1b1',
      light: '#efefef',
      dark: '#8d8d8d',
      contrastText: '#000000'
    },
    secondary: {
      main: '#bbdefb',
      light: '#eeffff',
      dark: '#8aacc8',
      contrastText: '#000000'
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


const root = ReactDOM.createRoot(document.querySelector("#app"));
root.render(
 <React.StrictMode>
    <BrowserRouter>
       <App />
    </BrowserRouter>
 </React.StrictMode>
);

registerServiceWorker();
