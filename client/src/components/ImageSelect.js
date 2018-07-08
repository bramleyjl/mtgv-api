import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import CardGroup from './CardGroup';
import NavBar from './NavBar';

class ImageSelect extends Component {
  constructor(props) {
    super(props);
    this.versionSelect = this.versionSelect.bind(this);
    this.finalizeVersions = this.finalizeVersions.bind(this);
    this.state = {
      cardImages: {},
      indexedScript: undefined,
      selectedVersions: {}
    };
  }

  componentDidMount() {
    this.getProps();
  }

  getProps() {
    let script = this.props.script;
    if (script !== '') {
      localStorage.setItem('script', script);
      this.downloadPreviews(script, true);
    } else {
      const cachedScript = localStorage.getItem('script');
      this.downloadPreviews(cachedScript, false);
    }
  }

  downloadPreviews = async (script, annotate) => {
    const config = {
      method: 'POST',
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        script: script,
      })
    }
    const response = await fetch('http://bramley.design:4000/api/imageSelect', config);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    
    if (annotate === true) {
      this.setState({
        indexedScript: body.indexedScript,
        cardImages: body.cardImages
      });
    } else {
      this.setState({
        indexedScript: script,
        cardImages:body.cardImages
      });
    }
    return body;
  };

  versionSelect(cardName, version) {
    this.setState({
      selectedVersions: {...this.state.selectedVersions, [cardName]: version}
    })
  }

  finalizeVersions(event) {
    event.preventDefault();
    var versionSubmit = {};
    const cardNames = Object.values(this.state.cardImages);
    for (var i = 0 ; i < cardNames.length; i++) {
      var name = Object.keys(cardNames[i])[0];
      var versions = Object.values(cardNames[i])[0];
      if (this.state.selectedVersions[name] === undefined) {
        for (var version in versions) {
          var versionLink = {};
          versionLink[version] =  versions[version];
          versionSubmit[name] = versionLink;
          break;
        }
      } else {
        versionSubmit[name] = this.state.selectedVersions[name];
      }
    }
    this.props.handleImageSelect(this.state.indexedScript, versionSubmit);
    this.props.history.push('/imageDownload');
  }

  render() {
    return (
    <div>
      <NavBar selectButton={true} />
      <Grid container>

        <Grid item xs={12}>
          <h1 className="pageTitle">Version Select</h1>
        </Grid>
      
        <form id="versionSelect" onSubmit={this.finalizeVersions.bind(this)}>

        <Grid item xs={12}>
          <div className="scriptDisplay">
            <input type="hidden" name="script" value={this.state.indexedScript} />
            <h3>Entered Script:</h3>
            <p id="baseScript">{this.state.indexedScript}</p>
          </div>
        </Grid>

        <Grid item xs={12}>
          <ol>
              {Object
                .keys(this.state.cardImages)
                .map(key => 
                  <li className="cardName">
                    <CardGroup
                      key={key}
                      index={key}
                      versionSelect={this.versionSelect}
                      details={this.state.cardImages[key]}
                      imageDownload={false}
                    />
                  </li>
              )}
          </ol>
        </Grid>
      
        </form>

      </Grid>
    </div>       
    );
  }
}

export default ImageSelect;