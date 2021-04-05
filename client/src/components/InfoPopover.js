import React from 'react';
import Modal from 'react-modal';

const customStyles = {
    content : {
      top                   : '20%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

class InfoPopover extends React.Component {
    constructor() {
      super();
    }
  
    render() {
      return (
        <div className="infoPopover">
          <Modal
            isOpen={this.props.open}
            onRequestClose={this.props.toggleModal}
            style={customStyles}
          >
              <h3>MtG Versioner is a side project developed and maintained by John Bramley.</h3>
              <h3>
                You can view the code, submit bug reports, and suggest new features on its <a href="https://github.com/bramleyjl/MTGVersioner" target="_blank">Github page.</a>
              </h3>
          </Modal>
        </div>
      );
    }
  }
  
  export default InfoPopover;