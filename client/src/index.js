import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import './css/index.css';
import ScriptEntry from './components/ScriptEntry';
import ImagePicker from './components/ImagePicker';
import registerServiceWorker from './registerServiceWorker';

const Root = () => {
  return (
    <BrowserRouter>
      <div>
        <Route exact path='/' component={ScriptEntry} />
        <Route path='/images' component={ImagePicker} />
      </div>
    </BrowserRouter>
  )
}

render(<Root />, document.querySelector('#root'));
registerServiceWorker();