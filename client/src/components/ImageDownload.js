import React, { Component } from 'react';
class ImageDownload extends Component {
	constructor(props) {
		super(props);
		this.state ={
			indexedScript: undefined,
			selectedVersions: undefined
		}
	}

	componentDidMount() {
  	this.getProps()
  }

  getProps() {
  	let script = this.props.script;
  	let versions = this.props.versions;
  	if (script && versions) {
  		localStorage.setItem('script', script);
  		localStorage.setItem('versions', JSON.stringify(versions));
  	} else {
  		script = localStorage.getItem('script');
  		versions = JSON.parse(localStorage.getItem('versions'));
  	}
  	this.setState({
  		indexedScript: script,
  		selectedVersions: versions
  	});
  	this.downloadPNGS(script, versions);
  }

  downloadPNGS = async(script, versions) => {
  	console.log(script)
  	console.log(versions)
  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 pageTitle">
            <a href="/"><h1>MtG Script Automater</h1></a>
          </div>
        </div>

      </div>       
    );
  }
}

export default ImageDownload;