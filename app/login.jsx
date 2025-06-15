import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper';
import { theme } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import { hp, wp } from '../helpers/common';
import Input from '../components/Input';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';

const Login = () => {
  const router= useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit= async() => {
    if(!emailRef.current || !passwordRef.current){
      Alert.alert('Login', "please fill all the fields.");
      return;
    }
    
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({
      email,
      password
    });
    //console.log('error: ', error);
    if(error){
      Alert.alert('Login', error.message); 
    }
    setLoading(false);
  }
  return (
    <ScreenWrapper bg={theme.colors.bg}>
      <StatusBar  style="dark"/>
      <View style={styles.container}>
        <View>
          <BackButton router={router} />
        </View>

        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Hey,</Text>
          <Text style={styles.welcomeText}>Welcome Back</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{fontSize: hp(1.5), color: 'black'}}>
            Please login to continue
          </Text>

          <Input
          icon={<Icon name="email-outline" size={40} color={theme.colors.light_gray}/>}
          placeholder='Enter your email'
          placeholderTextColor={theme.colors.textLight}
          onChangeText={value => emailRef.current = value}
          />

          <Input
          icon={<Icon name="lock-outline" size={40} color={theme.colors.light_gray}/>}
          placeholder='Enter your password'
          placeholderTextColor={theme.colors.textLight}
          secureTextEntry
          onChangeText={value => passwordRef.current = value}
          />
          <Text style={styles.forgotPassword}>
            Forgot Password?
          </Text>

          {/* button */}
          <Button title={'Login'} loading={loading} onPress={onSubmit}/>
        </View>

          {/* footer */}
          <View style= {styles.footer}>
            <Text style={styles.footerText}>
              Don't have an account?
            </Text>
            <Pressable onPress={() => router.push('signUp')}>
              <Text style={[styles.footerText, {color: theme.colors.primary, fontWeight: theme.fonts.semibold}]}>
                Sign up
              </Text>
            </Pressable>
          </View>
      </View>
    </ScreenWrapper>
  )
}
export default Login

const styles = StyleSheet.create({

  container:{
    flex:1,
    gap:45,
    paddingHorizontal: wp(5)
  },

  welcomeText:{
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: 'black'
  },

  form:{
    gap: 25
  },
  forgotPassword:{
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: 'black'
  },
  footer:{
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  footerText:{
    textAlign: 'center',
    color: theme.colors.black,
    fontSize: hp(1.6)
  }
})