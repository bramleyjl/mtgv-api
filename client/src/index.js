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
      light: '#76d275',
      main: '#43a047',
      dark: '#00701a',
      contrastText: '#2d2d2d',
    },
    secondary: {
      light: '#a4a4a4',
      main: '#757575',
      dark: '#494949',
      contrastText: '#f0f0f0',
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