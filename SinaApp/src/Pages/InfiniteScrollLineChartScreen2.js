/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect, useReducer, useCallback} from 'react';
import type {Node} from 'react';
import {data150 as data} from '../data/data';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  useWindowDimensions,
  LogBox,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import Svg, {G, Path, Rect, Use, Defs, ClipPath} from 'react-native-svg';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message

const App: () => Node = () => {
  let Index = 0;
  let IndexArray = 100;
  const window = useWindowDimensions();
  let myReq;
  const [Data, setData] = useState(`M0 ${toCords(data[IndexArray])}`);
  let display = false;

  // ==================

  function toCords(data) {
    return Math.floor(-data * 100 + 300);
  }

  const start = () => {
    // if (IndexArray <= data.length - 2) myReq = requestAnimationFrame(start);
    // if (Math.floor(Index) >= Math.floor(window.width)) {
    //   Index = 0;
    //   console.log(' | ', Math.floor(toCords(data[IndexArray])));
    //   setData(`M0 ${Math.floor(toCords(data[IndexArray]))}`);
    // }
    // setData(prev => {
    //   return prev + ` L${Index} ${Math.floor(toCords(data[IndexArray]))}`;
    // });
    // Index += 0.1;
    // IndexArray += 15;
    if (Math.floor(Index) >= Math.floor(window.width)) {
      Index = 0;
      setData(`M0 ${toCords(data[IndexArray])}`);
    }

    setData(prev => {
      return prev + ` L${Index} ${toCords(data[IndexArray])}`;
    });
    Index += 4;
    IndexArray += 20;
    if (IndexArray >= data.length - 1) {
      IndexArray = 0;
    }
    requestAnimationFrame(start);
  };

  useEffect(() => {
    // const myInterval = setInterval(() => {
    //   if (Math.floor(Index) >= Math.floor(window.width)) {
    //     Index = 0;
    //     setData(`M0 ${toCords(data[IndexArray])}`);
    //   }

    //   setData(prev => {
    //     return prev + ` L${Index} ${toCords(data[IndexArray])}`;
    //   });
    //   Index += 4;
    //   IndexArray += 20;
    //   if (IndexArray >= data.length - 1) {
    //     IndexArray = 0;
    //   }
    // }, 1000 / 150);
    // console.log(data.length);
    myReq = requestAnimationFrame(start);
    // cancelAnimationFrame(myReq);
    return () => cancelAnimationFrame(myReq);
    // return () => clearInterval(myInterval);
    // return () => null;
  }, []);

  return (
    <View>
      <Svg height="100%" width="100%">
        <Path d={Data} fill="none" stroke="red" strokeWidth={2} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  svgContainer: {
    heigh: 100,
    width: 100,
  },
  container: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: 'rgba(60,64,67,0.3)',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
    padding: 12,
  },
});

export default App;
