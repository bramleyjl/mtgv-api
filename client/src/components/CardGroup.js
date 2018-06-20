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
    selectedObject[selectedImage] = Object.values(this.props.details)[0][selectedImage];
    this.setState({
      liveImages: {}, 
      deadImages: Object.values(this.props.details)[0],
      selectedImage: selectedObject
    });
    this.props.versionSelect(Object.keys(this.props.details).toString(), selectedObject);
  }

  restoreImages() {
    this.setState({
      liveImages: Object.values(this.props.details)[0],
      deadImages: {},
      selectedImage: {}
    });
  }

  render() {
    var cardName = Object.keys(this.props.details).toString();

    return (
      <div>
        <h5>{cardName}</h5>
        <ul className="versionDisplay">
          {Object
            .keys(this.state.liveImages)
            .map(key => 
              <EditionDisplay 
                key={key} 
                edition={key} 
                cardName={cardName} 
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
                cardName={cardName} 
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