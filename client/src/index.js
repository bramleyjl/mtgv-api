import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';

import 'typeface-roboto';
import './css/index.css';
import Root from './components/Root';
import registerServiceWorker from './registerServiceWorker';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#98ee99',
      main: '#66bb6a',
      dark: '#338a3e',
      contrastText: '#000000',
    },
    secondary: {
      light: '#a4a4a4',
      main: '#757575',
      dark: '#494949',
      contrastText: '#ffffff',
    },
  },
});

const App = () => {
  return (
  	<MuiThemeProvider theme={theme}>
  		<Root />
  	</MuiThemeProvider>
  );
}

render(<App />, document.querySelector('#app'));
registerServiceWorker();