import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import {theme} from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const welcome = () => {
  const router = useRouter();

  return (
    <ScreenWrapper bg={theme.colors.bg}>
      <StatusBar style="dark"a/>
      <View style={styles.container} >
        {/* welcome image */}
        <Text style={styles.welcomeHeader}>Vegtopia</Text>
        {/*<Image style={styles.welcomeImage} resizeMode= 'contain' source={require('../assets/images/vegtopiaLogo.png')}  />*/}

          {/* footer */}
        <View style={styles.footer}>
          <Button title='Getting Started'
          buttonStyle={{marginHorizantal: wp(3)}}
          onPress={() => router.push('signUp')}
           />
        </View>

        <View style={styles.bottomTextContainer}>
          <Text style={styles.loginText}>
            Already have an account!
          </Text>

          <Pressable onPress={() => router.push('login')}>
            <Text style={[styles.loginText, {color: theme.colors.primary, fontWeight: theme.fonts.bold}]}>
              Login
            </Text>
          </Pressable>

        </View>

      </View>
    </ScreenWrapper>
  )
}

export default welcome

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg ,
    paddingHorizontal: wp(4),

  }, 
  welcomeHeader:{
    fontSize: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.colors.primary,
    fontFamily: 'AkayaKanadaka',
  },
  
  welcomeImage:{
    width: wp(10),
    height: hp(5),
    alignSelf: 'center',
  },  
  footer:{
    gap: 30,
    width: '100%',
    marginTop: 100
  },

  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  loginText:{
    textAlign: 'center',
    color: 'black',
    fontSize: hp(1.6)
  }
})