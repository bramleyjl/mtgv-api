import React, { Component } from 'react';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';


 class SelectButton extends Component {
  render() {
    return (
      <Button variant="contained" color="secondary" type="submit" form="versionSelect"> Prepare Versions </Button>
    )
  }
}
export default SelectButton;