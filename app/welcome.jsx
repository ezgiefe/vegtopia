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
        <Text style={styles.welcomeHeader}>Vegtopia</Text>

          {/* footer */}
        <View style={styles.footer}>
          <Button title='Hadi Başlayalım'
          buttonStyle={{marginHorizantal: wp(3)}}
          onPress={() => router.push('signUp')}
           />
        </View>

        <View style={styles.bottomTextContainer}>
          <Text style={styles.loginText}>
            Zaten bir hesabın mı var?
          </Text>

          <Pressable onPress={() => router.push('login')}>
            <Text style={[styles.loginText, {color: theme.colors.secondary, fontWeight: theme.fonts.bold}]}>
              Giriş Yap
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
    backgroundColor: 'white' ,
    paddingHorizontal: wp(4),

  }, 
  welcomeHeader:{
    fontSize: hp(5),
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.colors.primary,
    fontFamily: 'AkayaKanadaka',
  
  },
   
  footer:{
    gap: 30,
    width: '100%',
    marginTop: 100,
  },

  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  loginText:{
    textAlign: 'center',
    color: 'black',
    fontSize: hp(1.6)
  }
})