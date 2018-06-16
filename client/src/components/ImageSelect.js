import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CardGroup from './CardGroup';

class ImageSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardImages: {},
      indexedScript: undefined
    };
  }

  static propTypes = {
    script: PropTypes.string
  }

  componentDidMount() {
    this.getScript()
  }

  getScript() {
    let script = this.props.script;
    console.log('before if check' + script)
    if (script) {
      localStorage.setItem('script', script);
      console.log('script was passed through ' + localStorage.getItem('script'))
    } else {
      console.log('script from cache' + localStorage.getItem('script'))
      const cachedScript = localStorage.getItem('script');
      script = cachedScript;
    }
    this.callApi(script);
  }

  callApi = async (script) => {
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
    const response = await fetch('/imageSelect', config);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    
    this.setState({indexedScript: body.indexedScript});
    this.setState({cardImages: body.cardImages});

    return body;
  };

  render() {

    return (
      <div className="container">
        <div className="row">
          <div className="col-12 pageTitle">
            <a href="/"><h1>MtG Script Automater</h1></a>
          </div>
        </div>

        <form action="/imageDownload" method="POST">

        <div className="row">
          <div className="twelve columns">
            <input type="hidden" name="script" value="<%= baseScript %>"/>
            <h4>Entered Script:</h4>
            <p id="baseScript">This is a script blah blah blah [Squirrel Nest]</p>
          </div>
        </div>

        <div>
            {
              Object
              .keys(this.state.cardImages)
              .map(key => 
                  <CardGroup
                    key={key}
                    index={key}
                    details={this.state.cardImages[key]} 
                  />
              )
            }
        </div>


        </form>

      </div>       
    );
  }
}

export default ImageSelect;