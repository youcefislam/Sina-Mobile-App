import React, {useState, useEffect} from 'react';
import {
  Platform,
  ScrollView,
  Text,
  SafeAreaView,
  View,
  StyleSheet,
  Dimensions,
  LogBox,
  NativeModules,
  AppState,
  PermissionsAndroid,
  useWindowDimensions,
} from 'react-native';

import {Appbar, Button} from 'react-native-paper';

import BluetoothSerial, {
  withSubscription,
} from 'react-native-bluetooth-serial-next';
import {Buffer} from 'buffer';

import BluetoothModal from './src/components/BluetoothModal';
import DisconnectDialog from './src/components/DisconnectDialog';
import HearRate from './src/components/HearRate';
import RNFS from 'react-native-fs';
import {Dirs, FileSystem} from 'react-native-file-access';

import {data150_4 as data} from './src/data/data';
import Canvas, {
  Image as CanvasImage,
  Path2D,
  ImageData,
} from 'react-native-canvas';

LogBox.ignoreLogs(['new NativeEventEmitter']); // Ignore log notification by message
global.Buffer = Buffer;

const iconv = require('iconv-lite');
const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

// QRS detection module
const {QRSDetection} = NativeModules;

const AppColors = {
  BtnGreen: '#2ABF77',
  BtnRed: '#E81010',
  fontPlaceHolder: '#8CD1C7',
  fontTextSecondary: '#869C99',
  fontTextGreenHighligh: '#0DBDA5',
  fontTextGreenHighlighBlacked: '#007D6C',
  fontTextPrimary: '#0D423B',
  fontTextWhite: '#FAFCFF',
};

const App = props => {
  const [deviceConnected, setdeviceConnected] = useState(null);
  const [modalVisible, setModalVisible] = useState(true);
  const [bleActive, setBleActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [pairedDevicesList, setPairedDevicesList] = useState([]);
  const [visible, setVisible] = React.useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [Devices, setDevices] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [VisibleDia, setVisibleDia] = useState(false);
  const [hearRate, setHearRate] = useState('Calculating...');
  const [recording, setRecording] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const window = useWindowDimensions();

  let myCanvasCtx, myCanvasCtxEcg, HRInterval, interval, signalValue, calcul;
  let Index = 1;
  let IndexArray = 1;
  let counter = 0;
  let svgPathSet = [];
  let ecgData = [];
  let matrixPath;
  let saveFilePath = RNFS.ExternalDirectoryPath;
  let tempForHRCalculation = [];
  let tempLostData = [];

  const toggleBluetooth = async value => {
    try {
      if (value) {
        await BluetoothSerial.enable();
      } else {
        await BluetoothSerial.disable();
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  const requestEnable = () => async () => {
    try {
      await BluetoothSerial.requestEnable();
      setIsEnabled(true);
    } catch (e) {
      console.log(e.message);
    }
  };

  const bluetoothInit = async () => {
    try {
      // we check if the bluetooth is connected and get the list of all the paired devices
      const [isEnabled, devices] = await Promise.all([
        BluetoothSerial.isEnabled(), // check if bluetooth adapter service is enabled.
        BluetoothSerial.list(), // List all paired bluetooth devices.
      ]);

      setIsEnabled(isEnabled);
      setPairedDevicesList(() =>
        devices.map(device => ({
          ...device,
          paired: true,
          connected: false,
        })),
      );
    } catch (e) {
      console.log(e.message);
    }
  };

  useEffect(() => {
    bluetoothInit();

    // Event listener when bluetooth is turned on
    BluetoothSerial.on('bluetoothEnabled', () => {
      console.log('Bluetooth enabled');
      setIsEnabled(true);
    });

    // Event listener when bluetooth is turned off
    BluetoothSerial.on('bluetoothDisabled', () => {
      console.log('Bluetooth disabled');
      setIsEnabled(false);
    });

    // Event listener on success of connection with a device
    BluetoothSerial.on('connectionSuccess', ({device}) => {
      if (device) {
        console.log(`Device ${device.name}<${device.id}> has been connected`);
      }
    });

    // Event listener on fail of connection with a device
    BluetoothSerial.on('connectionFailed', ({device}) => {
      if (device) {
        console.log(
          `Failed to connect with device ${device.name}<${device.id}>`,
        );
      }
    });

    // Event listener on lost connection with a device
    BluetoothSerial.on('connectionLost', ({device}) => {
      if (device) {
        console.log(
          `Device ${device.name}<${device.id}> connection has been lost`,
        );
      }
    });

    // // Event listener when receiving data from device --important
    // BluetoothSerial.withDelimiter('\n').then(res => {
    //   console.log('delimiter setup', res);
    //   this.events.on('data', result => {
    //     if (result) {
    //       const {id, data} = result;
    //       this.dataFromBL.push(data.split(',')[1]);
    //     }
    //   });
    // });

    // Event listener if any error occur
    BluetoothSerial.on('error', e => {
      if (e) {
        console.log(`Error: ${e.message}`);
      }
    });

    return () => null;
  }, []);

  // List all unpaired bluetooth devices.
  const discoverUnpairedDevices = async () => {
    setIsSearching(true);
    if (isEnabled) getPairedDevices();

    try {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ).then(result => {
        if (!result) {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          );
        }
      });
      const unpairedDevices = await BluetoothSerial.listUnpaired();

      let newList = unpairedDevices.filter(device => {
        const found = Devices.find(element => element.id == device.id);
        if (!found)
          return {
            ...device,
            connected: false,
            paired: false,
          };
      });

      setIsSearching(false);
      setDevices(prev => [...prev, ...newList]);
    } catch (e) {
      console.log(e.message);
      setIsSearching(false);
      setDevices(devices =>
        devices.filter(device => device.paired || device.connected),
      );
    }
  };

  // Cancel bluetooth device discovery process.
  const cancelDiscovery = () => async () => {
    try {
      await BluetoothSerial.cancelDiscovery();
      setIsSearching(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  // pair from a bluetooth device.
  const pairDevice = async id => {
    setProcessing(true);

    try {
      const paired = await BluetoothSerial.pairDevice(id);

      if (paired) {
        console.log(`Device ${paired.name}<${paired.id}> paired successfully`);

        setDevices(
          Devices.map(v => {
            if (v.id === paired.id) {
              return {
                ...v,
                ...paired,
                paired: true,
              };
            }
            return v;
          }),
        );
        setProcessing(false);
      } else {
        console.log(`Device <${id}> pairing failed`);
        setProcessing(false);
      }
    } catch (e) {
      console.log(e.message);
      setProcessing(false);
    }
  };

  const getPairedDevices = async () => {
    try {
      // we check if the bluetooth is connected and get the list of all the paired devices
      const [isEnabled, devices] = await Promise.all([
        BluetoothSerial.isEnabled(), // check if bluetooth adapter service is enabled.
        BluetoothSerial.list(), // List all paired bluetooth devices.
      ]);

      setIsEnabled(isEnabled);
      setDevices(() =>
        devices.map(device => ({
          ...device,
          paired: true,
          connected: false,
        })),
      );
      setVisible(false);
    } catch (e) {
      console.log(e.message);
    }
  };

  const showModal = async () => {
    try {
      requestEnable();
      await BluetoothSerial.enable();
      setVisible(true);
    } catch (e) {
      console.log(e.message);
    }
  };
  const hideModal = () => setVisible(false);
  const showDialog = () => setVisibleDia(true);
  const hideDialog = () => setVisibleDia(false);

  // connect to a bluetooth device.
  const connect = async id => {
    setProcessing(true);

    try {
      const connected = await BluetoothSerial.device(id).connect();

      if (connected) {
        console.log(`Connected to device ${connected.name}<${connected.id}>`);
        console.log(connected);

        setdeviceConnected({
          ...connected,
          connected: true,
        });
        setProcessing(false);
        setVisible(false);
      } else {
        console.log(`Failed to connect to device <${id}>`);
        setProcessing(false);
      }
    } catch (e) {
      console.log(e.message);
      setProcessing(false);
    }
  };

  const connectToDevice = async ({id, connected}) => {
    if (!connected) {
      await connect(id);
    } else {
      //notify user that he is connected to this device
      console.log('Already connected');
    }
  };

  // disconnect from a bluetooth device.
  const disconnect = async id => {
    setProcessing(true);

    try {
      await BluetoothSerial.device(id).disconnect();

      setdeviceConnected(null);
      setProcessing(false);
    } catch (e) {
      console.log(e.message);
      setProcessing(false);
    }
  };

  // Canvas initialization
  const handleCanvas = async canvas => {
    if (canvas) {
      myCanvasCtx = canvas.getContext('2d');
      canvas.width = window.width;
      canvas.height = window.height * 0.6;
      myCanvas = canvas;
      let lineY = myCanvas.height / 6;
      let lineX = myCanvas.width / 6;
      // this is for the outside border
      // M0 0 L${myCanvas.width} 0 L${myCanvas.width} ${
      //   myCanvas.height
      // } L0 ${myCanvas.height} Z
      matrixPath = `M0 ${lineY} L${myCanvas.width} ${lineY} M0 ${lineY * 2} L${
        myCanvas.width
      } ${lineY * 2} M0 ${lineY * 3} L${myCanvas.width} ${lineY * 3} M0 ${
        lineY * 4
      } L${myCanvas.width} ${lineY * 4} M0 ${lineY * 5} L${myCanvas.width} ${
        lineY * 5
      } M${lineX} 0 L${lineX} ${myCanvas.height} M${lineX * 2} 0 L${
        lineX * 2
      } ${myCanvas.height} M${lineX * 3} 0 L${lineX * 3} ${myCanvas.height} M${
        lineX * 4
      } 0 L${lineX * 4} ${myCanvas.height} M${lineX * 5} 0 L${lineX * 5} ${
        myCanvas.height
      }`;
      myCanvasCtx.strokeStyle = '#0CAC96';
      myCanvasCtx.lineWidth = 0.2;
      myCanvasCtx.stroke(new Path2D(myCanvas, matrixPath));
    }
  };

  const toCords = data => {
    return Math.floor(-Number(data) * 0.4 + 450);
  };

  const startCanvasRealTime = () => {
    BluetoothSerial.read(
      (data, subscription) => {
        console.log(data.split(',')[1]);
        signalValue = data.split(',')[1];
        if (
          Math.floor(Index) >= Math.floor(myCanvas.width) ||
          svgPathSet.length == 0
        ) {
          Index = 0;
          myCanvasCtx.clearRect(0, 0, myCanvas.width, myCanvas.height);
          svgPathSet = [`M${Index} ${toCords(signalValue)}`];
          myCanvasCtx.beginPath();
          myCanvasCtx.strokeStyle = '#0CAC96';
          myCanvasCtx.lineWidth = 0.2;
          myCanvasCtx.stroke(new Path2D(myCanvas, matrixPath));
        }

        svgPathSet.push(`L${Index} ${toCords(signalValue)}`);
        if (counter > 2) {
          myCanvasCtx.strokeStyle = '#0DBDA5';
          myCanvasCtx.lineWidth = 2;
          myCanvasCtx.stroke(new Path2D(myCanvas, svgPathSet));
          counter = 0;
        } else {
          counter++;
        }
        ecgData.push(signalValue);
        FileSystem.appendFile(
          saveFilePath + `/${startRecord}.csv`,
          data[IndexArray] + ',',
          'utf8',
        ).catch(err => console.log('FileSystem Error:: ', err));
        Index += 2;
      },
      // if (this.imBoredNow && subscription) {
      //   BluetoothSerial.removeSubscription(subscription);
      // }

      '\r\n',
    );
  };

  const startCanvas = () => {
    setRecording(true);
    console.log(new Date(), ' Drawing start');
    svgPathSet = [`M${Index - 1} ${toCords(data[IndexArray - 1])}`];
    myCanvasCtx.beginPath();
    let startRecord = Date.now();
    // console.log(startRecord);
    interval = setInterval(async () => {
      if (Math.floor(Index) >= Math.floor(myCanvas.width)) {
        Index = 0;
        myCanvasCtx.clearRect(0, 0, myCanvas.width, myCanvas.height);
        svgPathSet = [`M${Index} ${toCords(data[IndexArray])}`];
        myCanvasCtx.beginPath();
        myCanvasCtx.strokeStyle = '#0CAC96';
        myCanvasCtx.lineWidth = 0.2;
        myCanvasCtx.stroke(new Path2D(myCanvas, matrixPath));
      }

      svgPathSet.push(`L${Index} ${toCords(data[IndexArray])}`);
      if (counter > 2) {
        myCanvasCtx.strokeStyle = '#0DBDA5';
        myCanvasCtx.lineWidth = 2;
        myCanvasCtx.stroke(new Path2D(myCanvas, svgPathSet));
        counter = 0;
      } else {
        counter++;
      }
      // if (calcul) tempLostData.push(data[IndexArray]);
      ecgData.push(data[IndexArray]);
      // FileSystem.appendFile(
      //   saveFilePath + `/${startRecord}.csv`,
      //   data[IndexArray] + ',',
      //   'utf8',
      // ).catch(err => console.log('FileSystem Error:: ', err));
      Index += 2;
      IndexArray += 1;
      if (IndexArray >= data.length - 1) {
        console.log(new Date(), ' Drawing End');

        clearInterval(interval);
        clearInterval(HRInterval);
      }
    }, 1000 / 60);

    HRInterval = setInterval(() => {
      tempForHRCalculation = ecgData.slice(ecgData.length - 500);
      QRSDetection.getHeartRate(tempForHRCalculation, 60, (error, hr) => {
        if (error) console.log(error);
        // console.log(hr);
        ecgData = [];
        setHearRate(hr * 6);
        if (hr < 40) {
          // Sinus Bradycardia arrhythmia detected
          // Send alerts here
        } else if (hr > 90) {
          // Sinus Tachycardia arrhythmia detected
          // Send alerts here
        }
      });
    }, 10000);
    setTimeout(() => {
      // console.log(new Date(), '60 seconds passed');
    }, 60000);
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <BluetoothModal
        visible={visible}
        hideModal={hideModal}
        isEnabled={isEnabled}
        isSearching={isSearching}
        discoverUnpairedDevices={discoverUnpairedDevices}
        devices={Devices}
        getPairedDevices={getPairedDevices}
        connectToDevice={connectToDevice}
        pairDevice={pairDevice}
        processing={processing}
      />
      <DisconnectDialog
        visible={VisibleDia}
        hideDialog={hideDialog}
        device={deviceConnected}
        disconnect={disconnect}
      />
      <Appbar.Header style={styles.topNavbar}>
        <Appbar.Content title="Bonjour" subtitle={'Youcef'} />
        <Button
          style={
            deviceConnected ? styles.ConnectBleBtn : styles.disconnectedBtn
          }
          icon="bluetooth"
          mode="contained"
          uppercase={false}
          labelStyle={
            deviceConnected
              ? styles.ConnectBleBtnTxt
              : styles.disConnectBleBtnTxt
          }
          onPress={deviceConnected ? showDialog : showModal}>
          {deviceConnected ? 'ECG Device' : 'Connecter'}
        </Button>
      </Appbar.Header>
      <View style={styles.EcgContainer}>
        {!deviceConnected && (
          <Button mode="contained" compact={true} onPress={() => startCanvas()}>
            Start
          </Button>
        )}
        {recording && <HearRate value={hearRate} />}
        <Canvas style={styles.canvasStyle} ref={handleCanvas} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  canvasStyle: {
    marginTop: 20,
  },
  mainContainer: {
    flex: 1,
  },
  topNavbar: {
    backgroundColor: 'white',
  },
  TopNavSwitchBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  TopNavSwitchBtnTxt: {
    fontWeight: 'bold',
    color: AppColors.fontTextWhite,
  },
  bluetoothBtn: {
    padding: 10,
    borderRadius: 10,
  },
  ConnectBleBtn: {
    backgroundColor: 'white',
  },
  disconnectedBtn: {
    backgroundColor: AppColors.BtnGreen,
  },
  ConnectBleBtnTxt: {
    color: 'black',
  },
  disConnectBleBtnTxt: {
    color: 'white',
  },
  defaultFontFamily: {
    fontFamily: '',
  },
  TopNavTitle: {
    flex: 1,
    justifyContent: 'center',
  },
  TopNavTitleTxt: {
    fontSize: 23,
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  connectToDeviceContainer: {
    flex: 1,
    backgroundColor: 'brown',
  },
  EcgContainer: {
    flex: 8,
  },
});

export default App;
