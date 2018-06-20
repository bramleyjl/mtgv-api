import React, { Component } from 'react';

import CardGroup from './CardGroup';

class ImageDownload extends Component {
	constructor(props) {
		super(props);
		this.state ={
			indexedScript: undefined,
			selectedVersions: {}
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
    const config = {
      method: 'POST',
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        script: script,
        versions: versions
      })
    }
    const response = await fetch('/imageDownload', config);
    const body = await response.json();
    console.log(body)
    // if (response.status !== 200) throw Error(body.message);
    
    // console.log(this.state.selectedVersions)

  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 pageTitle">
            <a href="/"><h1>MtG Script Automater</h1></a>
          </div>
        </div>

				<div className="row">
          <div className="col-10">
            <ol className="cardList">
              <li>
                {
                  Object
                  .keys(this.state.selectedVersions)
                  .map(key => 
                      <CardGroup
                        key={key}
                        index={key}
                        versionSelect={undefined}
                        details={this.state.selectedVersions[key]}
                        imageDownload={true} 
                      />
                  )
                }
              </li>
            </ol>
          </div>
          <div className="col-2">
            <button>Download Images</button>
          </div>
        </div>        

      </div>       
    );
  }
}

export default ImageDownload;