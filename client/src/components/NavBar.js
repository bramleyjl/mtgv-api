import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import SelectButton from './SelectButton.js';
import DownloadButton from './DownloadButton.js';

class NavBar extends Component {
  render() {
    return (
      <AppBar position="sticky">
        <Toolbar className="toolbar">
          <Button component={Link} to="/">MtG Script Automater</Button>        
          <Button component={Link} to="/about">About</Button>
          <Button href="https://github.com/BColsey/MTGScriptAutomater">GitHub</Button>
          <div style={{ flex: 1 }}></div>
          {this.props.selectButton === true ? <SelectButton/> : null }
          {this.props.downloadButton === true ? <Button style={{ 'marginRight': '15px' }} variant="contained" color="secondary" component={Link} to="/imageSelect">Back to Image Select</Button> : null }          
          {this.props.downloadButton === true ? <DownloadButton link={this.props.link}/> : null }
        </Toolbar>
      </AppBar>
    )
  }
}
export default NavBar;