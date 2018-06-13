import React, { Component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import HomePage from './HomePage';
import ImageSelect from './ImageSelect';

class Main extends Component {
  constructor() {
    super();
    this.state = {
      submittedScript: ''
    }
  }

	handleScript = (scriptValue) => {
		this.setState({submittedScript: scriptValue});
	}

	render() {
  	return (
    	<BrowserRouter>
      	<div>
        	<Route exact path='/' render={(props) => (
  					<HomePage {...props} checkScript={this.handleScript}/>
  				)}/>
        	<Route path='/imageSelect' component={ImageSelect} />
      	</div>
    	</BrowserRouter>
    );
  }
}

export default Main;