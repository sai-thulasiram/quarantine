import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import TouchID from "react-native-touch-id";

export default class FingerPrint extends Component {
  constructor() {
    super()

    this.state = {
      biometryType: null
    };
  }

  componentDidMount() {
    TouchID.isSupported()
    .then(biometryType => {
      this.setState({ biometryType });
    })
  }

  authenticate = () => {
  return TouchID.authenticate()
    .then(success => {
      this.props.sendAttendance();
      alert('Authenticated Successfully');
      
    })
    .catch(error => {
      console.log(error)
      alert(error.message);
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          style={styles.btn}
          onPress={this.clickHandler}
          underlayColor="#0380BE"
          activeOpacity={1}
        >
          <Text style={{
            color: '#fff',
            fontWeight: 'bold'
          }}>
            {`Authenticate`}
          </Text>
        </TouchableHighlight>
      </View>
    );
  }

  clickHandler = () => {
    TouchID.isSupported()
      .then(this.authenticate)
      .catch(error => {
        alert('TouchID not supported');
      });
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  btn: {
    borderRadius: 3,
    marginTop: 10,
    marginRight: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: '#FF8C00'
  }
});


