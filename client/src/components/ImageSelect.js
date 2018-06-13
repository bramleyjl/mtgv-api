import React, { Component } from 'react';

class ImageSelect extends Component {

  state = {
    response: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.baseScript, response2: res.cardImages }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
    const response = await fetch('/imageSelect', { method: 'POST' });
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

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

        <div class="row">
          <div class="twelve columns">
            <input type="hidden" name="script" value="<%= baseScript %>"/>
            <h4>Entered Script:</h4>
            <p id="baseScript">This is a script blah blah blah [Squirrel Nest]</p>
            <p className="App-intro">{this.state.response}</p>
            <p className="App-intro">{this.state.response2}</p>
          </div>
        </div>


        </form>

      </div>       
    );
  }
}

export default ImageSelect;