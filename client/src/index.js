import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './css/index.css';
import HomePage from './components/HomePage';
import ImagePicker from './components/ImagePicker';
import registerServiceWorker from './registerServiceWorker';

const Root = () => {
  return (
    <BrowserRouter>
      <div>
        <Route exact path='/' component={HomePage} />
        <Route path='/images' component={ImagePicker} />
      </div>
    </BrowserRouter>
  )
}

render(<Root />, document.querySelector('#root'));
registerServiceWorker();