import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
// import { withRouter } from 'react-router';

import HomePage from './HomePage';
import ImageSelect from './ImageSelect';
import ImageDownload from './ImageDownload';

class Main extends Component {
  constructor(props) {
    super(props);
    this.handleScript = this.handleScript.bind(this);
    this.handleVersion = this.handleVersion.bind(this);
    this.state = {
      submittedScript: '',
      versionSubmit: undefined
    }
  }

	handleScript = (scriptValue) => {
    this.setState({submittedScript: scriptValue});
	}

  handleVersion = (indexedScript, versionSubmit) => {
    this.setState({
      submittedScript: indexedScript,
      versionSubmit: versionSubmit
    });
  }

	render() {
  	return (
    	<BrowserRouter>
        <div>
        	<Route exact path='/' render={(props) => (
  					<HomePage {...props} checkScript={this.handleScript}/>
  				)}/>
          <Route path='/imageSelect' render={(props) => (
            <ImageSelect {...props} script={this.state.submittedScript} 
            handleImageSelect={this.handleVersion} />
          )}/>
          <Route path='/imageDownload' render={(props) => (
            <ImageDownload {...props} script={this.state.submittedScript}
            versions={this.state.versionSubmit} />
          )}/>          
      	</div>
    	</BrowserRouter>
    );
  }
}

export default Main;