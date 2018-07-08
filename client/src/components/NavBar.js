import React, { Component } from 'react';

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
          <Button href="/">MtG Script Automater</Button>
          <Button href="/about">About</Button>
          <Button href="https://github.com/BColsey/MTGScriptAutomater">GitHub</Button>
          <div style={{ flex: 1 }}></div>
          {this.props.selectButton === true ? <SelectButton/> : null }
          {this.props.downloadButton === true ? <Button style={{ 'margin-right': '10px' }} variant="contained" color="secondary" href='/imageSelect'>Back to Image Select</Button> : null }          
          {this.props.downloadButton === true ? <DownloadButton link={this.props.link}/> : null }
        </Toolbar>
      </AppBar>
    )
  }
}
export default NavBar;