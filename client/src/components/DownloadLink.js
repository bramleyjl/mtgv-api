import React from 'react';

class DownloadLink extends React.Component {

  render() {
    return (
   	<div> 
      <a href={"http://localhost:4000/download/" + this.props.link}>Download Package {this.props.link}</a>
    </div>
    )
  }
}

export default DownloadLink;