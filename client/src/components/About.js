import React, { Component } from 'react';

import NavBar from './NavBar';
import Grid from '@material-ui/core/Grid';

class About extends Component {
  render() {
    return (
      <div>
        <NavBar />

	      <Grid container>
	        <Grid item xs={12}>
	          <h1 className="pageTitle">About</h1>
	        </Grid>
	      </Grid>

        <Grid container justify="space-around">
        	<Grid item lg={6} md={8} sm={10} xs={12} className="aboutText">
		  			<p>MtG Script Automater parses text and utilizes <a href="https://scryfall.com/docs/api">Scryfall's API</a> to allow you to quickly and easily download high quality images of as many Magic: the Gathering cards as you choose. It was written with a MERN stack by <a href="http://bramley.design">John Bramley</a> for <a href="https://www.youtube.com/user/TheManaSource">The Mana Source's</a> creator Wedge to expedite his script writing process.</p>
		  			<p>For full documentation and detailed instructions check out the project's <a href="https://github.com/BColsey/MTGScriptAutomater/blob/master/README.md">README</a>.</p>
		  		</Grid>
		  	</Grid>

      </div>
    )
  }
}
export default About;