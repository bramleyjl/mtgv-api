import React, { Component } from "react";
import FinalCardGroup from "./FinalCardGroup";

import Grid from "@material-ui/core/Grid";
import NavBar from "./NavBar";
import Loading from "./Loading";

class ImageDownload extends Component {
  constructor(props) {
    super(props);
    this.returnToImageSelect = this.returnToImageSelect.bind(this);
    this.state = {
      loading: true,
      indexedScript: "",
      downloadButton: false,
      pdf: "",
    };
  }

  componentDidMount() {
    let indexedScript = this.props.indexedScript;
    let versions = this.props.versions;
    if (indexedScript && versions) {
      localStorage.setItem("indexedScript", indexedScript);
      localStorage.setItem("versions", JSON.stringify(versions));
    } else {
      indexedScript = localStorage.getItem("indexedScript");
      versions = JSON.parse(localStorage.getItem("versions"));
    }
    this.setState({
      indexedScript: indexedScript,
      selectedVersions: versions,
    });

    const config = {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        script: indexedScript,
        versions: versions,
      }),
    };
    fetch(process.env.REACT_APP_URL + "/api/preparePdf", config)
      .then((res) => res.json())
      .then((json) =>
        this.setState({
          pdf: json.pdfLink,
          downloadButton: true,
          loading: false,
        })
      );
  }

  returnToImageSelect(event) {
    event.preventDefault();
    this.props.history.push("/imageSelect");
  }

  render() {
    return (
      <div>
        <NavBar
          downloadButton={this.state.downloadButton}
          link={this.state.pdf}
        />
        <Grid container>
          <Grid item xs={12}>
            <h1 className="pageTitle">Image Download</h1>
          </Grid>

          {this.state.loading ? (
            <Loading />
          ) : (
            <div>
              <Grid item xs={12}>
                <div className="scriptDisplay">
                  <input
                    type="hidden"
                    name="script"
                    value={this.state.indexedScript}
                  />
                  <h4>Entered Script:</h4>
                  <p id="baseScript">{this.state.indexedScript}</p>
                </div>
              </Grid>

              <Grid item xs={12}>
                <ol>
                  {Object.keys(this.state.selectedVersions).map((key) => (
                    <FinalCardGroup
                      key={key}
                      index={key}
                      details={this.state.selectedVersions[key]}
                    />
                  ))}
                </ol>
              </Grid>
            </div>
          )}
        </Grid>
      </div>
    );
  }
}

export default ImageDownload;
