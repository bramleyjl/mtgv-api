import React from 'react';
import EditionDisplay from './EditionDisplay';

class CardGroup extends React.Component {
  constructor(props) {
    super(props);
    this.removeImages = this.removeImages.bind(this);
    this.restoreImages = this.restoreImages.bind(this);
    this.state = {
      liveImages: {},
      deadImages: {},
      selectedImage: {}
    }
  }

  componentDidMount() {
    this.restoreImages();
  }

  removeImages(selectedImage) {
    const selectedObject = {};
    selectedObject[selectedImage] = this.props.details[selectedImage];
    this.setState({
      liveImages: {}, 
      deadImages: this.props.details,
      selectedImage: selectedObject
    });
  }

  restoreImages() {
    this.setState({
      liveImages: this.props.details,
      deadImages: {},
      selectedImage: {}
    });
  }

  render() {
    const {index} = this.props;

    return (
      <div className="card">
        <h5>{index}</h5>
        <ul className="versionDisplay">
          {Object
            .keys(this.state.liveImages)
            .map(key => 
              <EditionDisplay 
                key={key} 
                edition={key} 
                cardName={index} 
                link={this.state.liveImages[key]}
                onClick={() => this.removeImages(key)} 
              /> 
            )
          }
          {Object
            .keys(this.state.selectedImage)
            .map(key => 
              <EditionDisplay 
                key={key} 
                edition={key} 
                cardName={index} 
                link={this.state.selectedImage[key]}
                onClick={() => this.restoreImages()} 
              /> 
            )
          }
        </ul>
      </div>
    )
  }
}

export default CardGroup;