import React from 'react';
import SelectEditionDisplay from './SelectEditionDisplay';

class SelectCardGroup extends React.Component {
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
    this.props.versionSelect(this.props.index, selectedObject);
  }

  restoreImages() {
    this.setState({
      liveImages: Object.values(this.props.details)[0],
      deadImages: {},
      selectedImage: {}
    });
  }

  render() {
    var cardName = Object.keys(this.props.details)[0];
    var cardCount = Object.values(this.props.details)[1];
    return (
      <li className="cardName">
      <h5>{cardName} ({cardCount})</h5>
        <ul className="versionDisplay">
          {Object
            .keys(this.state.liveImages)
            .map(key => 
              <SelectEditionDisplay 
                key={key} 
                multiverse={key} 
                cardName={cardName} 
                data={this.state.liveImages[key]} 
                onClick={() => this.removeImages(key)}
              />                  
            )
          }
          {Object
            .keys(this.state.selectedImage)
            .map(key => 
              <SelectEditionDisplay 
                key={key} 
                muliativerse={key} 
                cardName={cardName} 
                data={this.state.selectedImage[key]}
                onClick={() => this.restoreImages()}
              /> 
            )
          }
        </ul>
      </li>
    )
  }
}

export default SelectCardGroup;