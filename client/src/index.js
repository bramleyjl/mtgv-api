import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import "typeface-roboto";
import "./css/index.css";
import Root from "./components/Root";
import registerServiceWorker from "./registerServiceWorker";

const theme = createMuiTheme({
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
  }
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Root />
    </ThemeProvider>
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
