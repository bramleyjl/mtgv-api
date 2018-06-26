import React, { Component } from 'react';
import CardGroup from './CardGroup';
import DownloadLink from './DownloadLink';
//import download from 'js-file-download';
//import Beforeunload from 'react-beforeunload';

class ImageDownload extends Component {
  constructor(props) {
    super(props);
    this.returnToImageSelect = this.returnToImageSelect.bind(this);
    this.downloadImages = this.downloadImages.bind(this);
    this.state ={
      indexedScript: undefined,
      selectedVersions: {},
      downloadLink: ''
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
    this.setState({
      downloadLink: body.downloadLink
    });
  };

  downloadImages = async (event) => {
    event.preventDefault();    
    const config = {
      method: 'GET',
      headers: new Headers({
        'Accept': 'application/zip',
        'Content-Type': 'application/zip'
      })
    }
    fetch('./download/' + this.state.downloadLink)
  }

  returnToImageSelect(event) {
    event.preventDefault();
    this.props.history.push('/imageSelect');
  }

  removeZip(link) {
    console.log('removing the zip!!!!!')
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 pageTitle">
            <a href="/"><h1>MtG Script Automater</h1></a>
          </div>
        </div>


        <div className="row">
          <div className="col-12">
            <input type="hidden" name="script" value={this.state.indexedScript} />
            <h4>Entered Script:</h4>
            <p id="baseScript">{this.state.indexedScript}</p>
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
            <a href='/imageSelect'>Back to Image Select</a>
            { this.state.downloadLink ? 
              <DownloadLink link={this.state.downloadLink} /> : 
              null 
            }
          </div>
        </div>

      </div>       
    );
  }
}

export default ImageDownload;