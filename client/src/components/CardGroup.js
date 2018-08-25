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
    if (this.props.imageDownload === false) {
      const selectedObject = {};
      selectedObject[selectedImage] = Object.values(this.props.details)[0][selectedImage];
      this.setState({
        liveImages: {}, 
        deadImages: Object.values(this.props.details)[0],
        selectedImage: selectedObject
      });
      this.props.versionSelect(this.props.index, selectedObject);
    }
  }

  restoreImages() {
    if (this.props.imageDownload === false) {
      this.setState({
        liveImages: Object.values(this.props.details)[0],
        deadImages: {},
        selectedImage: {}
      });
    } else {
      var versionName = Object.keys(this.props.details).toString();
      var versionDisplay = {};
      versionDisplay[versionName] = Object.values(this.props.details)[0]
      this.setState({
        liveImages: versionDisplay
      })
    }
  }

  render() {
    var cardName = undefined;
    if (this.props.imageDownload === false) {
      cardName = Object.keys(this.props.details).join(', ');
    } else {
      cardName = Object.values(this.props.details)[0][1].join(', ');
    }
    var viewerIndex = parseInt(this.props.index, 10) + 1;
    return (
      <li className="cardName">
      <h5>({viewerIndex}) {cardName}</h5>
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
      </li>
    )
  }
}

export default CardGroup;