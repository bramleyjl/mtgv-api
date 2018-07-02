import React from 'react';

import Button from '@material-ui/core/Button';

class DownloadButton extends React.Component {

  render() {
    return (
   	<div>
   		<Button variant="contained" color="secondary" type="submit" href={"http://bramley.design:4000/api/download/" + this.props.link}> Download Package </Button> 
    </div>
    )
  }
}

export default DownloadButton;