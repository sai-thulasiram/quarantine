/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Dimensions
} from 'react-native';
import {
  Colors
} from 'react-native/Libraries/NewAppScreen';

import Routes from './Routes';

class App extends React.PureComponent {

  render () {
    return (
       <View style={styles.container}>
        <StatusBar
          backgroundColor="#1c313a"
          barStyle="light-content"
        />
        <Routes/>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container : {
    flex: 1
  }
});

export default App;
