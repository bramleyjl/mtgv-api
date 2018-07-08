import React, { Component } from 'react';

import Button from '@material-ui/core/Button';

class SelectButton extends Component {
  render() {
    return (
      <Button variant="contained" color="secondary" type="submit" form="versionSelect">Prepare Versions</Button>
    )
  }
}
export default SelectButton;