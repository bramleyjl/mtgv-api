import React from 'react';

class DownloadLink extends React.Component {

  render() {
    return (
   	<div> 
      <a href={"http://localhost:4000/download/" + this.props.link}><button>Download Package</button></a>
    </div>
    )
  }
}

export default DownloadLink;