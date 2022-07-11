// import React, {useState} from 'react';
// import {
//   ScrollView,
//   Text,
//   SafeAreaView,
//   View,
//   ActivityIndicator,
//   Modal,
//   StyleSheet,
//   TouchableOpacity,
//   Switch,
// } from 'react-native';

// import {Buffer} from 'buffer';
// global.Buffer = Buffer;

// const BluetoothModal = props => {
//   return (
//     <Modal animationType="slide" visible={props.visible} transparent={true}>
//       <View style={styles.modalCenterContainer}>
//         <Text>Bluetooth</Text>

//         <Switch onValueChange={props.toggleBluetooth} value={props.isEnabled} />
//       </View>
//     </Modal>
//   );
// };

// export default BluetoothModal;

// const styles = StyleSheet.create({
//   modalCenterContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 22,
//   },
//   modalContentContainer: {
//     height: '80%',
//     width: '60%',
//     backgroundColor: 'white',
//     alignSelf: 'center',
//     justifySelf: 'center',
//   },
// });

import React, {useState, useEffect} from 'react';
import {
  Modal,
  Portal,
  Text,
  Button,
  Provider,
  Divider,
  Appbar,
  Avatar,
  Card,
  IconButton,
  ActivityIndicator,
  MD2Colors,
} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';

const HearRate = props => {
  useEffect(() => {
    return () => null;
  }, []);

  return <Text>{props.value}</Text>;
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'white',
    width: '90%',
    height: '80%',
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  searchBtn: {
    backgroundColor: 'white',
  },
  searchBtnTxt: {
    color: 'black',
  },
  connectToBleBtn: {
    color: '#0DBDA5',
  },
});

export default HearRate;
