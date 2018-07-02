import React, { Component } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SelectButton from './SelectButton.js';
import DownloadButton from './DownloadButton.js';

 class NavBar extends Component {
  render() {
    return (
      <AppBar position="sticky">
        <Toolbar>
          <Button href="/" color="inherit">Home</Button>
          <Button href="/about" color="inherit">About</Button>
          <Button href="https://github.com/BColsey/MTGScriptAutomater" color="inherit">GitHub</Button>
          {this.props.selectButton === true ? <SelectButton /> : null }
          {this.props.downloadButton === true ? <DownloadButton link={this.props.link} /> : null }
        </Toolbar>
      </AppBar>
        )
}
}
export default NavBar;