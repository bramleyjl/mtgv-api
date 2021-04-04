import React from "react";
import { setCodes } from '../assets/setCodes';

class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.loadColorsAnimation = this.loadColorsAnimation.bind(this);
    this.state = {
      image: "",
      loading: this.props.loading,
    };
  }

  componentDidMount() {
    this.loadColorsAnimation();
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.setState({ loading: false });
  }

  loadColorsAnimation() {
    const imageCode = setCodes[Math.floor(Math.random() * setCodes.length)];
    this.setState({
      image: imageCode,
    });
    this.timer = setTimeout(() => {
      this.loadColorsAnimation();
    }, 1500);
  }

  render() {
    return (
      <div className="loadingText">
        <h1>Shuffling...</h1>
        <h1>
          <i className={"ss ss-" + this.state.image + " ss-6x"}></i>
        </h1>
        <h4>(This can sometimes take awhile, especially with many cardname entries)</h4>
      </div>
    );
  }
}

export default Loading;
