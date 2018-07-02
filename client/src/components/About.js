import React, { Component } from 'react';
import NavBar from './NavBar';


import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SelectButton from './SelectButton.js';
import DownloadButton from './DownloadButton.js';

 class About extends Component {
  render() {
    return (
      <div>
        <NavBar />
        <p>About</p>
      </div>
        )
    }
}
export default About;