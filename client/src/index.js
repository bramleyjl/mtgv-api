import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';

//import 'bootstrap/dist/css/bootstrap.min.css';
import 'typeface-roboto';
import './css/index.css';
import Root from './components/Root';
import registerServiceWorker from './registerServiceWorker';

const theme = createMuiTheme({
  palette: {
    primary: grey,
    secondary: green,
  },
  status: {
    danger: 'orange',
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