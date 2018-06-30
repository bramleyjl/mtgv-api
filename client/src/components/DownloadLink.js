import React from 'react';

class DownloadLink extends React.Component {

  render() {
    return (
   	<div> 
      <a href={"http://bramley.design:4000/api/download/" + this.props.link}><button>Download Package</button></a>
    </div>
    )
  }
}

export default DownloadLink;