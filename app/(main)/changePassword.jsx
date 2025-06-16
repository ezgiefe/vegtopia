import { Alert, StyleSheet, Text, View, ScrollView } from 'react-native';
import React, { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import Header from '../../components/Header';
import { supabase } from '../../lib/supabase';
import { validatePassword } from '../../helpers/validation'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ChangePassword = () => {
  const router = useRouter();
  const newPasswordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const onSubmit = async () => {
    const newPassword = newPasswordRef.current.trim();
    const confirmPassword = confirmPasswordRef.current.trim();

    let formIsValid = true;

    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.isValid) {
      setNewPasswordError(newPasswordValidation.message);
      formIsValid = false;
    } else {
      setNewPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Lütfen yeni şifreyi tekrar girin.');
      formIsValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Şifreler eşleşmiyor.');
      formIsValid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (!formIsValid) {
      Alert.alert('Şifre Değiştir', 'Lütfen şifreleri doğru formatta girin.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Şifre güncelleme hatası:', error.message);
        Alert.alert('Şifre Değiştir', error.message);
        return;
      }

      Alert.alert('Başarılı', 'Şifreniz başarıyla değiştirildi!');
      router.back(); 
    } catch (err) {
      console.error('Beklenmedik hata:', err.message);
      Alert.alert('Hata', 'Şifre değiştirme sırasında beklenmedik bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper bg={theme.colors.bg}>
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Header title="Şifre Değiştir" />

          <View style={styles.form}>
            <Text style={{ fontSize: hp(1.5), color: theme.colors.text, marginBottom: hp(1) }}>
              Yeni şifrenizi girin
            </Text>

            <Input
              icon={<Icon name="lock-outline" size={26} color={theme.colors.primary_soft} />}
              placeholder="Yeni Şifre"
              placeholderTextColor={theme.colors.textLight}
              secureTextEntry
              onChangeText={(value) => {
                newPasswordRef.current = value;
                setNewPasswordError('');
              }}
            />
            {newPasswordError ? <Text style={styles.errorText}>{newPasswordError}</Text> : null}

            <Input
              icon={<Icon name="lock-outline" size={26} color={theme.colors.primary_soft} />}
              placeholder="Yeni Şifre Tekrar"
              placeholderTextColor={theme.colors.textLight}
              secureTextEntry
              onChangeText={(value) => {
                confirmPasswordRef.current = value;
                setConfirmPasswordError('');
              }}
            />
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

            <Button title="Şifreyi Değiştir" loading={loading} onPress={onSubmit} />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default ChangePassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
    paddingTop: hp(2), 
  },
  form: {
    gap: 25,
    marginTop: hp(2),
  },
  errorText: {
    color: 'red',
    fontSize: hp(1.4),
    marginTop: hp(-1),
    marginBottom: hp(1),
    marginLeft: wp(1),
  },
});