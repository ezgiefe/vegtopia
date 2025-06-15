import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BackButton = ({size=40, router}) => {
  return (
    <Pressable onPress={() => router.back()} style={styles.button}>
      <Icon name="chevron-left" size={size} color= {theme.colors.primary} />
    </Pressable>
  )
}

export default BackButton

const styles = StyleSheet.create({

    button:{
        alignSelf: 'flex-start',
        padding: 5,
        borderRadius: theme.radius.sm
    }
})