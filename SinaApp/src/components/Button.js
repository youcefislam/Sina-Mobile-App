import React from 'react';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';

const Button = ({title, onPress, style, textStyle}) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text style={[styles.buttonText, textStyle]}>{title.toUpperCase()}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 0.9,
    backgroundColor: '#f5fcff',
  },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
    backgroundColor: '#22509d',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 16,
    alignSelf: 'center',
    color: '#fff',
  },
  enableInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listContainer: {
    borderColor: '#ccc',
    borderTopWidth: 0.5,
  },
  listItem: {
    flex: 1,
    height: 'auto',
    paddingHorizontal: 16,
    borderColor: '#ccc',
    borderBottomWidth: 0.5,
    justifyContent: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  listItemStatus: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 2,
    paddingBottom: 2,
    fontWeight: 'bold',
    fontSize: 12,
    color: '#fff',
  },
  footer: {
    height: 52,
    borderTopWidth: 1,
    borderTopColor: '#999',
  },
  fixedFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  button: {
    height: 36,
    margin: 5,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#22509d',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonRaised: {
    backgroundColor: '#22509d',
    borderRadius: 2,
    elevation: 2,
  },
});

export default Button;
