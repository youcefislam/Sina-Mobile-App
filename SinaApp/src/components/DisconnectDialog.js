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
import {Button, Paragraph, Dialog, Portal, Provider} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';

const DisconnectDialog = props => {
  useEffect(() => {
    return () => null;
  }, []);

  return (
    <Portal>
      <Dialog
        visible={props.visible}
        onDismiss={props.hideDialog}
        theme={{roundness: 15}}>
        <Dialog.Content>
          <Paragraph>
            Vous êtes déjà connecté à {props.device && props.device.name}
          </Paragraph>
          <Paragraph>vous voulez vous déconnecter ?</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            uppercase={false}
            onPress={() => {
              props.disconnect(props.device.id);
              props.hideDialog();
            }}
            labelStyle={styles.disconnectBtnTxt}>
            Déconnecter
          </Button>
          <Button
            uppercase={false}
            onPress={props.hideDialog}
            labelStyle={styles.closeBtnTxt}>
            Fermer
          </Button>
        </Dialog.Actions>
      </Dialog>
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
  disconnectBtnTxt: {
    color: 'red',
  },
  closeBtnTxt: {
    color: 'black',
  },
});

export default DisconnectDialog;
