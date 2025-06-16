import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Input from '../../components/Input';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import BackButton from '../../components/BackButton';
import Loading from '../../components/Loading';
import Avatar from '../../components/Avatar';
import { fetchAllUsers } from '../../services/userService'; 
import { useAuth } from '../../contexts/AuthContext';

const Search = () => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [allUsers, setAllUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      const res = await fetchAllUsers(); 
      if (res.success) {
        setAllUsers(res.data);
        setFilteredUsers(res.data.filter(u => u.id !== currentUser?.id)); 
      } else {
        console.error('Kullanıcılar çekilirken hata:', res.msg);
      }
      setLoading(false);
    };
    getUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allUsers.filter(user =>
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        user.id !== currentUser?.id
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(allUsers.filter(u => u.id !== currentUser?.id));  
    }
  }, [searchQuery, allUsers]);

  if (loading) {
    return (
      <ScreenWrapper bg={theme.colors.bg} style={styles.center}>
        <Loading />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg={theme.colors.bg}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton router={router} />
          <Text style={styles.headerTitle}>Ara</Text>
        </View>

        <View style={styles.searchBarContainer}>
          <Input
            placeholder="Kullanıcı adı ara..."
            placeholderTextColor={theme.colors.textLight}
            onChangeText={setSearchQuery}
            value={searchQuery}
            containerStyles={{ flex: 1, height: hp(6), borderRadius: theme.radius.sm }}
            icon={<Icon name="magnify" size={hp(2.5)} color={theme.colors.textLight} />}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchIcon}>
              <Icon name="close-circle" size={hp(2.5)} color={theme.colors.textLight} />
            </Pressable>
          )}
        </View>

        {/* User List */}
        <FlatList
          data={filteredUsers}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <Pressable onPress={() => Alert.alert('Profil Görüntüleme', `Kullanıcı: ${item.username}`)} style={styles.userItem}>
              <Avatar uri={item.image} size={hp(5)} rounded={theme.radius.xs} />
              <Text style={styles.userName}>{item.username}</Text>
            </Pressable>
          )}
          ListEmptyComponent={
            searchQuery.length > 0 && filteredUsers.length === 0 ? (
              <Text style={styles.noResults}>"{searchQuery}" için sonuç bulunamadı.</Text>
            ) : null
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingTop: hp(2),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  headerTitle: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    marginLeft: wp(3),
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
    gap: wp(2),
  },
  clearSearchIcon: {
    padding: wp(1),
  },
  listStyle: {
    paddingBottom: hp(2),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1.2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    gap: wp(3),
  },
  userName: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
  },
  noResults: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: hp(5),
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});