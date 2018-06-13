import React from 'react';
import { render } from 'react-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';
import Main from './components/Main';
import registerServiceWorker from './registerServiceWorker';

const Root = () => {
  return (
  	<Main />
  )
}

render(<Root />, document.querySelector('#root'));
registerServiceWorker();