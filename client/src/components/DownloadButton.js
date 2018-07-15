import React from 'react';

import Button from '@material-ui/core/Button';

class DownloadButton extends React.Component {
  render() {
    return (
   	<div>
   		<Button variant="contained" color="secondary" type="submit" href={process.env.REACT_APP_URL + "/api/download/" + this.props.link}> Download Package </Button> 
    </div>
    )
  }
}

export default DownloadButton;