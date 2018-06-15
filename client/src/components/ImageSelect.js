import React, { Component } from 'react';

class ImageSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {response: []};
  }


  componentDidMount() {
    this.callApi();
  }

  callApi = async () => {
    const config = {
      method: 'POST',
      headers: new Headers({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify({
        script: this.props.script,
      })
    }
    const response = await fetch('/imageSelect', config);
    const body = await response.json();
    console.log(body)

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  render() {

    const {script} = this.props;

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


        </form>

      </div>       
    );
  }
}

export default ImageSelect;