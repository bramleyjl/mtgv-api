import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
// import { withRouter } from 'react-router';

import HomePage from './HomePage';
import ImageSelect from './ImageSelect';

class Main extends Component {
  constructor(props) {
    super(props);
    this.handleScript = this.handleScript.bind(this);
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
          <Route path='/imageSelect' render={(props) => (
            <ImageSelect {...props} script={this.state.submittedScript}/>
          )}/>
      	</div>
    	</BrowserRouter>
    );
  }
}

export default Main;