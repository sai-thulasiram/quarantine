import React, { Component } from 'react';
import {Router, Stack, Scene} from 'react-native-router-flux';

import Login from './pages/Login';
import Signup from './pages/Signup';
import MapView from './components/MapView';

export default class Routes extends Component {
	render() {
		return(
			<Router>
			    <Stack key="root" hideNavBar={true}>
			      {/*<Scene key="login" component={Login} title="Login" initial={true}/> */}
			      <Scene key="signup" component={Signup} title="Register" initial={true}/>
				  <Scene key="mapview" component={MapView} title="MapView"/>
			    </Stack>
			 </Router>
			)
	}
}