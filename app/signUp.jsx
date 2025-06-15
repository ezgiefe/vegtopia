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
import { validateEmail, validatePassword, validateUsername } from '../helpers/validation';
import { isUsernameAvailable, updateUser } from '../services/userService';

const SignUp = () => {
    const router= useRouter();
    const emailRef = useRef("");
    const nameRef = useRef("");
    const usernameRef = useRef("");
    const passwordRef = useRef("");
    const [loading, setLoading] = useState(false);

    const [nameError, setNameError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
  
    const onSubmit= async() => {      
      let name = nameRef.current.trim();
      let username = usernameRef.current.trim();
      let email = emailRef.current.trim();
      let password = passwordRef.current.trim();

      if (!name) {setNameError('İsim boş olamaz.');} 
      else {setNameError('');}

      const usernameValidation = validateUsername(username);
      setUsernameError(usernameValidation.isValid ? '' : usernameValidation.message);

      const emailValidation = validateEmail(email);
      setEmailError(emailValidation.isValid ? '' : emailValidation.message);

      const passwordValidation = validatePassword(password);
      setPasswordError(passwordValidation.isValid ? '' : passwordValidation.message);

      setLoading(true);
      try {

      const availabilityRes = await isUsernameAvailable(username);

      if (!availabilityRes.success) { 
            setLoading(false);
            
            console.error('Kullanıcı adı müsaitliği kontrol edilirken hata:', availabilityRes.msg || 'Bilinmeyen bir hata oluştu.'); 
            Alert.alert('Kayıt Ol', 'Teknik hata. Lütfen daha sonra tekrar deneyin.'); 
            return;
        }

      if (!availabilityRes.isAvailable) {
        setLoading(false);
        setUsernameError('Bu kullanıcı adı zaten alınmış.'); 
        Alert.alert('Kayıt Ol', 'Bu kullanıcı adı zaten alınmış. Lütfen farklı bir kullanıcı adı deneyin.');
        return;
      }

      const { data: { session }, error: error } = await supabase.auth.signUp({
            email,
            password,
        });

      console.log('--- Supabase signUp Sonucu Debug ---');
      console.log('Session objesi:', session);
      console.log('Auth Hata objesi:', error);
      console.log('--- End Supabase signUp Debug ---');

      if(error){
        setLoading(false);
        Alert.alert('Kayıt Ol', error.message); 
        return;
      }

      if (!session?.user?.id) {
        console.log("DEBUG: session veya user.id null. Büyük ihtimalle e-posta onayı bekleniyor.");
        setLoading(false); // Loading'i kapat
        Alert.alert('Kayıt Başarılı', 'Hesabınız oluşturuldu. Lütfen e-postanızı onaylayın ve giriş yapın.');
        router.push('login'); // Kullanıcıyı giriş sayfasına yönlendir
        return; // Fonksiyonu burada durdur
      }

      if (session?.user?.id) {
            const profileData = {
                username: username,
                name: name,
                email: email
            };
            const profileRes = await updateUser(session.user.id, profileData); 
            
            if (!profileRes.success) {
                console.error('updateUser ile kullanici olusturulamadi:', profileRes.msg);
                Alert.alert('Kayıt Ol', 'Hesap oluşturuldu ancak profil bilgileri kaydedilirken bir sorun oluştu.');
            }
        } 

      if (session) {
            Alert.alert('Kayıt Başarılı', 'Hesabınız oluşturuldu ve giriş yapıldı!');
            router.push('home');
        } else {
            Alert.alert('Kayıt Başarılı', 'Hesabınız oluşturuldu. Lütfen e-postanızı onaylayın ve giriş yapın.');
            router.push('login');
        }
    } catch (error) { // try bloğu içinde beklenmedik bir hata olursa
        console.error('An unexpected error occurred during sign up:', error);
        Alert.alert('Hata', 'Kayıt işlemi sırasında bir hata oluştu.');
    } finally { setLoading(false); } // try veya catch bloğu nasıl biterse bitsin, bu kod çalışır 

    }
  return (
    <ScreenWrapper bg={theme.colors.bg}>
      <StatusBar  />
      <View style={styles.container}>
        <BackButton router={router} />

        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Hadi</Text>
          <Text style={styles.welcomeText}>Başlayalım</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{fontSize: hp(1.5), color: 'black'}}>
            Bir hesap oluşturmak için lütfen aşağıdaki detayları doldurun
          </Text>

          <Input
          icon={<Icon name="account-outline" size={40} color={theme.colors.primary_soft}/>}
          placeholder='Adınızı giriniz'
          placeholderTextColor={theme.colors.textLight}
          onChangeText={value => { nameRef.current = value; setNameError(''); }}
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          <Input
          icon={<Icon name="at" size={40} color={theme.colors.primary_soft}/>}
          placeholder='Kullanıcı adı giriniz'
          placeholderTextColor={theme.colors.textLight}
          onChangeText={value => { usernameRef.current = value; setUsernameError(''); }}
          />
          {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

          <Input
          icon={<Icon name="email-outline" size={40} color={theme.colors.primary_soft}/>}
          placeholder='Emailinizi giriniz'
          placeholderTextColor={theme.colors.textLight}
          onChangeText={value => { emailRef.current = value; setEmailError(''); }}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <Input
          icon={<Icon name="lock-outline" size={40} color={theme.colors.primary_soft}/>}
          placeholder='Şifrenizi giriniz'
          placeholderTextColor={theme.colors.textLight}
          secureTextEntry
          onChangeText={value => { passwordRef.current = value; setPasswordError(''); }}
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <Text style={styles.forgotPassword}>
            Şifreni mi unuttun?
          </Text>

          {/* button */}
          <Button title={'Sign up'} loading={loading} onPress={onSubmit}
          />
        </View>

          {/* footer */}
          <View style= {styles.footer}>
            <Text style={styles.footerText}>
              Zaten bir hesabın mı var?
            </Text>
            <Pressable onPress={() => router.push('login')}>
              <Text style={[styles.footerText, {color: theme.colors.primary, fontWeight: theme.fonts.semibold}]}>
                Login
              </Text>
            </Pressable>
          </View>
      </View>
    </ScreenWrapper>
  )
}
export default SignUp

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
  },
  errorText: {
        color: 'red',
        fontSize: hp(1.4),
        marginTop: hp(-1), 
        marginBottom: hp(1),
        marginLeft: wp(1),
    },
})