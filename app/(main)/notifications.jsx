import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { fetchNotifications, markNotificationsAsRead } from '../../services/notificationService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import NotificationItem from '../../components/NotificationItem';

const Notifications = () => {

  const [notifications, setNotifications] = useState([]);
  const {user} = useAuth();
  const router = useRouter();

  useEffect(()=>{
    getNotifications();

    if (user?.id) {
      markNotificationsAsRead(user.id);
    }
  },[]);

  const getNotifications = async ()=>{
    let res = await fetchNotifications(user.id);
    if(res.success) setNotifications(res.data);
  }
  
  return (
    <ScreenWrapper bg='white'>
      <View style={styles.container}>
        <Header title="Bildirimler" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
          {
            notifications.map(item=>{
              return (
                <NotificationItem 
                  key={item.id}
                  item={item} 
                  router={router}
                />
              )
            })
          }
          {
            notifications.length==0 && (
              <Text style={styles.noData}>Daha bildiriminiz yok</Text>
            )
          }
        </ScrollView>
      </View>   
    </ScreenWrapper>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center',
  }
})