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

const BluetoothModal = props => {
  useEffect(() => {
    props.getPairedDevices();
    return () => null;
  }, []);

  return (
    <Portal>
      <Modal
        visible={props.visible}
        onDismiss={props.hideModal}
        contentContainerStyle={[
          styles.containerStyle,
          props.processing && {justifyContent: 'center', alignItems: 'center'},
        ]}>
        {props.processing ? (
          <ActivityIndicator
            size={'large'}
            animating={true}
            color={'#0DBDA5'}
          />
        ) : (
          props.devices.map(
            device =>
              device && (
                <Card.Title
                  key={device.id}
                  title={device.name}
                  subtitle={`${device.id}`}
                  left={props => (
                    <Avatar.Icon
                      {...props}
                      color="#FAFCFF"
                      style={{
                        backgroundColor: device.paired ? '#0DBDA5' : '#E06A10',
                      }}
                      icon="bluetooth"
                    />
                  )}
                  right={props1 => (
                    <Button
                      {...props1}
                      mode="outlined"
                      uppercase={false}
                      labelStyle={{
                        fontSize: 12,
                        color: device.paired ? '#0DBDA5' : '#E06A10',
                      }}
                      style={{marginRight: 10}}
                      raised
                      theme={{
                        roundness: 10,
                        colors: {
                          primary: device.paired ? '#0DBDA5' : '#E06A10',
                        },
                      }}
                      onPress={() =>
                        device.paired
                          ? props.connectToDevice(device)
                          : props.pairDevice(device.id)
                      }>
                      {device.paired ? 'Connect' : 'Apparier'}
                    </Button>
                  )}
                />
              ),
          )
        )}
        <Appbar style={styles.bottom}>
          <Button
            icon="magnify"
            mode="contained"
            uppercase={false}
            style={styles.searchBtn}
            mode="contained"
            uppercase={false}
            loading={props.isSearching}
            labelStyle={styles.searchBtnTxt}
            onPress={props.discoverUnpairedDevices}
            disabled={props.isSearching}>
            Rechercher
          </Button>
        </Appbar>
      </Modal>
    </Portal>
  );
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

export default BluetoothModal;
