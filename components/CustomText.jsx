import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme'; 

const Text = ({ style, children, ...restProps }) => {
  return (
    <Text style={[styles.defaultText, style]} {...restProps}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'SpaceMono-Regular', 
    color: theme.colors.text, 
    fontSize: 16, 
  },
});

export default CustomText;