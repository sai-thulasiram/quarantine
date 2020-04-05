import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Geocoder from 'react-native-geocoding';
import Geolocation from '@react-native-community/geolocation';

import { Actions } from 'react-native-router-flux';

import { GEOLOCATION_OPTIONS } from './MyLocationMapMarker';

Geocoder.init("AIzaSyAYC6ixUQiDXaNDA5OnYYOuyJg43VaQKhw");

const URL = 'https://akkz2jpx61.execute-api.ap-south-1.amazonaws.com/dev/covid/suspects';

export default class Logo extends Component {

  constructor(props) {
    super(props);
    this.mounted = false;
    this.state = {
      myPosition: null,
      address: '',
      values: {},
      loading: false
    };
  }

  componentDidMount() {
    this.mounted = true;
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then(granted => {
        if (granted && this.mounted) {
          this.getLocation();
        }
      });
    } else {
      this.getLocation();
    }
  }

  getLocation = () => {
    console.log('getCurrentPosition in form #####################');
    this.watchID = Geolocation.getCurrentPosition(
      position => {
        const myPosition = position.coords;
        console.log('getCurrentPosition ' + JSON.stringify(myPosition));
        let address = '';
        Geocoder.from(myPosition.latitude, myPosition.longitude)
          .then(json => {
            address = json.results[0].formatted_address || json.results[0].address_components[0];
            this.setState({ address });
          })
          .catch(error =>
            console.warn(error)
          );
        this.setState({ myPosition });
      },
      null,
      GEOLOCATION_OPTIONS
    );
  }

  onChangeText = (val, key) => {
    this.setState({
      values: {
        ...this.state.values,
        [key]: val
      }
    });
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  register = () => {
    this.setState({
      loading: true
    });
    const { values, myPosition } = this.state;
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "phoneNumber": values['phone'],
        "suspectName": values['name'],
        "baseLattitude": myPosition.latitude,
        "baseLongitude": myPosition.longitude,
        "quarantimeNode": "Person got exposed"
      })
    };
    fetch(URL, requestOptions)
      .then(response => response.json())
      .then(async (responseJson) => {

        const id = responseJson && responseJson.body && responseJson.body.registrationId;
        console.log('getting response from fetch ', responseJson);
        try {
          await AsyncStorage.setItem('myLocation', JSON.stringify({
            values,
            myPosition,
            id
          }));
        } catch (error) {
          console.log(error.message);
        }
        this.setState({
          loading: false
        }, this.showMap);

      })
      .catch(error => {
        console.log(error);
        alert('!!!!!!!!!! Unabel to register at this moment. Please try after some time');
      })
  }

  showMap() {
    Actions.mapview();
  }

  render() {
    const { values, myPosition, loading, address } = this.state;
    const pos = myPosition && `${myPosition.latitude}, ${myPosition.longitude}`;
    return (
      <View style={styles.container}>
        {loading &&
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#0c9" />
          </View>
        }
        <TextInput style={styles.inputBox}
          underlineColorAndroid='rgba(0,0,0,0)'
          placeholder="Phone Number"
          placeholderTextColor="#ffffff"
          selectionColor="#fff"
          keyboardType="email-address"
          onChangeText={text => this.onChangeText(text, 'phone')}
          value={values['phone']}
          onSubmitEditing={() => this.name.focus()}
          />
        <TextInput style={styles.inputBox}
          underlineColorAndroid='rgba(0,0,0,0)'
          placeholder="Name"
          placeholderTextColor="#ffffff"
          value={values['name']}
          onChangeText={text => this.onChangeText(text, 'name')}
          ref={(input) => this.name = input}
          />
        <TextInput style={styles.inputBox}
          underlineColorAndroid='rgba(0,0,0,0)'
          placeholder="Getting Location..."
          value={pos}
          placeholderTextColor="#ffffff"
          editable={false}
          />
        <TextInput style={styles.inputBox}
          underlineColorAndroid='rgba(0,0,0,0)'
          placeholder="Address"
          value={address}
          placeholderTextColor="#ffffff"
          numberOfLines={4}
          multiline={true}
          />
        <TouchableOpacity style={styles.button} onPress={this.register}>
          <Text style={styles.buttonText}>{this.props.type}</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  inputBox: {
    width: 300,
    backgroundColor: 'rgba(255, 255,255,0.2)',
    borderRadius: 25,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    marginVertical: 10
  },
  button: {
    width: 300,
    backgroundColor: '#1c313a',
    borderRadius: 25,
    marginVertical: 10,
    paddingVertical: 13
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center'
  },
  loader: {
    position: 'absolute',
    margin: 'auto',
    zIndex: 9999
  }

});