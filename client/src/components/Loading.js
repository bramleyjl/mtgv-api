import React from 'react';

class Loading extends React.Component {

  constructor(props) {
    super(props);
    this.loadColorsAnimation = this.loadColorsAnimation.bind(this);
    this.state = {
      image: 'blahblah',
      loading: this.props.loading
    }
    this.sets = ['arn', 'atq', 'leg', 'drk', 'fem', 'hml', 'ice', 'all', 'csp', 'mir', 'vis', 'wth', 'tmp', 'sth', 'exo', 'usg', 
    'ulg', 'uds', 'mmq', 'nem', 'pcy', 'inv', 'pls', 'apc', 'ody', 'tor', 'jud', 'ons', 'lgh', 'scg', 'mrd', 'dst', '5dn', 'chk', 
    'bok', 'sok', 'rav', 'gpt', 'dis', 'tsp', 'plc', 'fut', 'lrw', 'mor', 'shm', 'eve', 'ala', 'con', 'arb', 'zen', 'wwk', 'roe', 
    'som', 'mbs', 'nph', 'isd', 'dka', 'avr', 'rtr', 'gtc', 'dgm', 'ths', 'bng', 'jou', 'ktk', 'frf', 'dtk', 'bfz', 'ogw', 'soi', 
    'emn', 'kld', 'aer', 'akh', 'hou', 'xln', 'rix', 'dom', 'lea', 'leb', '2ed', '3ed', '4ed', '5ed', '6ed', '7ed', '8ed', '9ed', 
    '10e', 'm10', 'm11', 'm12', 'm13', 'm14', 'm15', 'ori', 'm19', 'hop', 'arc', 'cmd', 'pc2', 'cm1', 'c13', 'cns', 'c14', 'c15', 
    'cn2', 'c16', 'pca', 'cma', 'e01', 'e02', 'c17', 'cm2', 'bbd', 'c18', 'chr', 'ath', 'brb', 'btd', 'dkm', 'mma', 'mm2', 'ema', 
    'mm3', 'ima', 'a25', 'por', 'p02', 'ptk', 's99', 's00', 'w16', 'w17', 'evg', 'dd2', 'ddc', 'ddd', 'dde', 'ddf', 'ddg', 'ddh', 
    'ddi', 'ddj', 'ddk', 'ddl', 'ddm', 'ddn', 'ddo', 'ddp', 'ddq', 'ddr', 'dds', 'ddt', 'ddu', 'drb', 'v09', 'v0x', 'v10', 'v11', 
    'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'h09', 'pd2', 'pd3', 'md1', 'ugl', 'unh', 'ust'];
  }

  componentDidMount() {
    setTimeout( ()=> this.loadColorsAnimation(), 500);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.setState({ loading: false });
  }


  loadColorsAnimation() {
    var imageCode = this.sets[Math.floor(Math.random() * this.sets.length)];
    this.setState({
      image: imageCode
    });
    this.timer = setTimeout(()=> {
      this.loadColorsAnimation()
    }, 1000);
  };

  render() {

    return (
      <div className="loadingText">
        <h1>Shuffling...</h1>
        <h1><i className={"ss ss-" + this.state.image + " ss-6x"}></i></h1>
      </div>
    )
  
  }
}

export default Loading;