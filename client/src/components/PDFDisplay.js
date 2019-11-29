import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import FinalizeEditionDisplay from './FinalizeEditionDisplay';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class PDFDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numPages: null,
      pageNumber: 1
    }
  }

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  }

  componentDidMount() {
    console.log(this.props);
    // var versionId = Object.keys(this.props.details)[0].toString();
    // var versionDisplay = {};
    // versionDisplay[versionId] = Object.values(this.props.details)[0];
    // this.setState({
    //   liveImages: versionDisplay
    // });
  }

  render() {
    const { pageNumber, numPages } = this.state;

    return (
      <div>
        <Document file={"./assets/pdfs/" + this.props.pdf + ".pdf"} onLoadSuccess={this.onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
        <p>Page {pageNumber} of {numPages}</p>
      </div>
    )
  }
}

export default PDFDisplay;