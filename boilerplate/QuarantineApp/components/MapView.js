/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

const customStyle = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#242f3e',
      },
    ],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#263c3f',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#6b9a76',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#38414e',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#212a37',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#9ca5b3',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [
      {
        color: '#746855',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#1f2835',
      },
    ],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#f3d19c',
      },
    ],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [
      {
        color: '#2f3948',
      },
    ],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#d59563',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#515c6d',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#17263c',
      },
    ],
  },
];

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Dimensions,
  AppState
} from 'react-native';
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-community/async-storage';
import PushNotification from 'react-native-push-notification';
import { getDistance } from 'geolib';
import MapView, { Circle } from 'react-native-maps';

import MyLocationMapMarker from './MyLocationMapMarker';
import Authenticate from './Authenticate';

const DEFAULT_PADDING = { top: 50, right: 10, bottom: 50, left: 0 };
const defaultRegion = {
  latitude: 12.972442,
  longitude: 77.580643
};

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.000522;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const circleRadius = 10;

const zoneBreachURL = 'https://akkz2jpx61.execute-api.ap-south-1.amazonaws.com/dev/covid/zonebreachers';

const noBreachURL = 'https://akkz2jpx61.execute-api.ap-south-1.amazonaws.com/dev/covid/attendancelog';


class MapComponent extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      region: {
        ...defaultRegion,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      center: {
        ...defaultRegion
      },
      validLocation: false
    };
  }

  async componentDidMount() {
    const userDetails = await AsyncStorage.getItem('myLocation');
    const userJson = JSON.parse(userDetails);
    this.setState({
      center: {
        ...userJson.myPosition
      }
    });
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('NOTIFICATION: ', notification);
      },
      popInitialNotification: true,
    });
    this.interval = setInterval(() => {
      console.log('time for authentiation');
      this.sendNotification('!!!!!!! Time for authentication !!!!!!! ');
    }, 60000);
    // AppState.addEventListener('change', this.appStateListener);  
  }

  appStateListener = (state) => {
    if (state === 'active') {
      PushNotification.popInitialNotification((notification) => {
        if (notification) {
          console.log('NOTIFICATION: ', notification);
        }
      });
    }
  };

  componentWillUnmount() {
    clearInterval(this.interval);
    // AppState.removeEventListener('change', this.handleAppStateChange);
  };

  // This will notify the user in 3 seconds after sending the app to the 
  // background (like after pressing the home button or switching apps)
  handleAppStateChange(appState) {
    if (appState === 'background') {
      // Schedule a notification
      PushNotification.localNotificationSchedule({
        message: 'Scheduled delay notification message', // (required)
        date: new Date(Date.now() + (3 * 1000)) // in 3 secs
      });
    }
  };

  sendNotification(message) {
    PushNotification.localNotification({
      message: message,
      priority: "max", // (optional) set notification priority, default: high
      visibility: "public", // (optional) set notification visibility, default: private
      importance: "max",
    });
  };

  updateRegion = val => {
    const {
      center } = this.state;

    const retVal = this.checkDistance(val, center);
    if (retVal.breached) {
      this.sendNotification('!!!!!!! Outside quarantine zone ');
      this.sendUpdate(retVal);
    }
    this.setState({
      region: {
        ...this.state.region,
        ...val
      }
    });
  }

  checkDistance = (coordinates, zone) => {
    const distance = getDistance(
      { latitude: coordinates.latitude, longitude: coordinates.longitude },
      { latitude: zone.latitude, longitude: zone.longitude }
    );

    if (distance >= circleRadius) {
      return { distance, breached: true };
    }

    return { distance, breached: false };
  }

  sendUpdate = async (breachData) => {
    const userDetails = await AsyncStorage.getItem('myLocation');
    const userJson = JSON.parse(userDetails);
    const { values, myPosition, id } = userJson;
    const { region } = this.state;
    let retVal = breachData ;
    if (!breachData) {
      retVal = this.checkDistance(region, myPosition);
      if (retVal.breached) {
        this.sendNotification('!!!!!!! Outside quarantine zone !!!!!!');
      }
    }
    const data = {
      "phoneNumber": values['phone'],
      "suspectName": values['name'],
      "baseLattitude": region.latitude,
      "baseLongitude": region.longitude,
      "registrationID": id,
      distanceFromBaseLocation: retVal.distance
    };
    if (retVal.breached) {
      data['zoneBreachType'] = 'QUARANTINE_ZONE_BREACH';
      URL = zoneBreachURL;
    } else {
      data['zoneBreachType'] = 'NO_BREACH';
      URL = noBreachURL;
    }
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

    // Sending Quarantine breach data
    fetch(URL, requestOptions)
      .then(response => response.json())
      .then(async (responseJson) => {
        console.log('getting response from fetch in update loc', responseJson);
      })
      .catch(error => {
        console.log(error);
        alert('!!!!!!!!!! Unable to send location. Please try authenticating again after some time !!!!!!!');
      })
    
    // Send attendance log as well in case of BREACH
    if (retVal.breached) {
      fetch(noBreachURL, requestOptions)
        .then(response => response.json())
        .then(async (responseJson) => {
          console.log('getting response from no breach fetch in update loc', responseJson);
        })
        .catch(error => {
          console.log(error);
          alert('!!!!!!!!!! Unable to send location. Please try authenticating again after some time !!!!!!!');
        })
    }
    
  }

  render() {
    const { center } = this.state;
    return (
      <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}

          <View style={styles.body}>
            <View style={styles.engine}>
              <Authenticate sendAttendance={this.sendUpdate} />
            </View>
            <View style={styles.mapWrapperContainer}>
              <MapView
                customMapStyle={customStyle}
                ref={ref => {
                  this.map = ref;
                } }
                style={styles.mapContainer}
                initialRegion={this.state.region}
                region={this.state.region}>
                <Circle
                  center={center}
                  radius={circleRadius}
                  fillColor="rgba(250, 250, 250, 0.5)"
                  strokeColor="rgba(0,0,0,0.5)"
                  zIndex={2}
                  strokeWidth={5}
                  />
                <MyLocationMapMarker updateRegion={this.updateRegion} />
              </MapView>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
    zIndex: 9999,
    top: 0
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  mapWrapperContainer: {
    marginTop: 0,
  },
  mapContainer: {
    height: height,
    width: width
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default MapComponent;
