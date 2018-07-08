import React, { Component } from 'react';

import CardGroup from './CardGroup';
import Grid from '@material-ui/core/Grid';
import NavBar from './NavBar';

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
    this.getPNGS(script, versions);
  }

  getPNGS = async(script, versions) => {
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
    const response = await fetch('http://bramley.design:4000/api/hiRezPrepare', config);
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
    fetch('http://bramley.design:4000/api/download/' + this.state.downloadLink, config);
  }

  returnToImageSelect(event) {
    event.preventDefault();
    this.props.history.push('/imageSelect');
  }

  render() {
    return (
      <div>
        <NavBar downloadButton={true} link={this.state.downloadLink} />
        <Grid container>
        
          <Grid item xs={12}>
            <h1 className="pageTitle">Image Download</h1>
          </Grid>

          <Grid item xs={12}>
            <div className="scriptDisplay">
              <input type="hidden" name="script" value={this.state.indexedScript} />
              <h4>Entered Script:</h4>
              <p id="baseScript">{this.state.indexedScript}</p>
            </div>
          </Grid>

          <Grid item xs={10}>
            <ol className="downloadList">
              {
                Object
                .keys(this.state.selectedVersions)
                .map(key => 
                  <li className="cardName">
                    <CardGroup
                      key={key}
                      index={key}
                      versionSelect={undefined}
                      details={this.state.selectedVersions[key]}
                      imageDownload={true} 
                    />
                  </li>
                )
              }
            </ol>
          </Grid>

        </Grid>
      </div>       
    );
  }
}

export default ImageDownload;