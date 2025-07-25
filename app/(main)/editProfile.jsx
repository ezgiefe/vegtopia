import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Header from '../../components/Header'
import { theme } from '../../constants/theme'
import { hp, wp } from '../../helpers/common'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useAuth } from '../../contexts/AuthContext'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../components/Button'
import BackButton from "../../components/BackButton";

import * as ImagePicker from "expo-image-picker";
import { isUsernameAvailable, updateUser } from "../../services/userService";
import {
  getFilePath,
  getUserImageSrc,
  uploadFile,
} from "../../services/imageService";
import Input from '../../components/Input'
import { validateUsername } from '../../helpers/validation'
import { Picker } from '@react-native-picker/picker';

const EditProfile = () => {

  const { user: currentUser, setUserData } = useAuth();
  const router = useRouter();
  const [profileModal, toggleProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    name: "",
    username: "",
    phoneNumber: "",
    image: null,
    bio: "",
    address: "",
    lifeStyle: "",
  });

  const [usernameError, setUsernameError] = useState(''); // kullanıcı adı hatası state'i
  const [prevUsername, setPrevUsername] = useState(''); // mevcut kullanıcı adını tutmak için


  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        username: currentUser.username || "",
        phoneNumber: currentUser.phoneNumber || "",
        image: currentUser.image || null,
        address: currentUser.address || "",
        bio: currentUser.bio || "",
        lifeStyle: currentUser.lifeStyle || "",
      });
      setPrevUsername(currentUser.username || '');
    }
  }, [currentUser]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled) {
      setUser({ ...user, image: result.assets[0] });
    }
  };

  const handleUsernameChange = (value) => {
    setUser({ ...user, username: value });
    const { isValid, message } = validateUsername(value); 
    if (!isValid) {
      setUsernameError(message);
    } else {
      setUsernameError(''); 
    }
  };

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, username, lifeStyle, image, bio, address } = userData;
    userData.email = currentUser.email;
    if (!name || !username || !lifeStyle || !bio) {
      Alert.alert("Profile", "Please fill all the fields");
      return;
    }

    if (!image) {
      Alert.alert("Profile", "Please choose a profile image");
      return;
    }

    const { isValid: usernameFormatValid, message: usernameFormatMessage } = validateUsername(username);
    if (!usernameFormatValid) {
      setUsernameError(usernameFormatMessage);
      Alert.alert("Profil", usernameFormatMessage);
      return;
    } else {
      setUsernameError('');
    }

// Sadece kullanıcı adı değiştirilmişse
    if (username !== prevUsername) { 
        setLoading(true); 
        const availabilityRes = await isUsernameAvailable(username); 
        setLoading(false);

        if (!availabilityRes.success) {
            Alert.alert('Hata', availabilityRes.msg);
            return;
        }
        if (!availabilityRes.isAvailable) {
            setUsernameError('Bu kullanıcı adı zaten alınmış.');
            Alert.alert('Profil', 'Bu kullanıcı adı zaten alınmış.');
            return;
        }
    }

    setLoading(true);
    if (typeof image == "object") {
      let imageResult = await uploadFile("profiles", image?.uri, true);
      if (imageResult.success) userData.image = imageResult.data;
      else userData.image = null;
    }

    const res = await updateUser(currentUser?.id, userData);
    setLoading(false);
    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      router.back();
    }
    else {
      Alert.alert('Hata', res.msg); 
    }
  };

  let imageSource =
    user.image && typeof user?.image == "object"
      ? user.image.uri
      : getUserImageSrc(user.image);

  return (
    <ScreenWrapper bg={theme.colors.bg}>
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
            <Header title="Edit Profile" />

            {/* form */}
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" strokeWidth={2.5} size={20} />
              </Pressable>
            </View>
            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              Please fill your profile details
            </Text>
            <Input
              icon={<Icon name="account-outline" size={26} />}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textLight}
              value={user.name}
              onChangeText={(value) => setUser({ ...user, name: value })}
            />
            <Input
              icon={<Icon name="at" size={26} />}
              placeholder="Enter your username"
              placeholderTextColor={theme.colors.textLight}
              value={user.username}
              onChangeText={(value) => setUser({ ...user, username: value })}
            />
            <Input
              icon={<Icon name="map-marker-outline" size={26} />}
              placeholder="Enter your address"
              placeholderTextColor={theme.colors.textLight}
              value={user.address}
              onChangeText={(value) => setUser({ ...user, address: value })}
            />

            <Input
              placeholder="Enter your bio"
              placeholderTextColor={theme.colors.textLight}
              onChangeText={(value) => setUser({ ...user, bio: value })}
              multiline={true}
              value={user.bio}
              containerStyle={styles.bio}
            />

            <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Yaşam Tarzı:</Text>
                <Picker
                    selectedValue={user.lifeStyle} 
                    onValueChange={(itemValue, itemIndex) =>
                        setUser({ ...user, lifeStyle: itemValue }) 
                    }
                    style={styles.picker}
                    itemStyle={styles.pickerItem} 
                >
                    <Picker.Item label="Seçiniz..." value="" enabled={false} /> 
                    <Picker.Item label="Vegan" value="Vegan" />
                    <Picker.Item label="Vejetaryen" value="Vejetaryan" />
                    <Picker.Item label="Navegan" value="Navegan" />
                </Picker>
            </View>
            
            <Pressable onPress={() => router.push('changePassword')}>
              <Text style={styles.password}>
                Şifreni mi unuttun?
              </Text>
            </Pressable>
            
            <Button title="Update" loading={loading} onPress={onSubmit} />
          </View>
          
        </ScrollView>
        
      </View>
    </ScreenWrapper>
  )
}

export default EditProfile

const styles = StyleSheet.create({
    container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  form: {
    gap: 25,
    marginTop: 20,
  },
  input: {
    flexDirection: "row",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    padding: 17,
    paddingHorizontal: 20,
    gap: 15,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
  password: {
    color: theme.colors.primary, 
    fontWeight: theme.fonts.semibold,
    fontSize: hp(1.7),
    textAlign: 'right',
    marginRight: 30,
  }
})