import { FlatList, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';
import Header from '../../components/Header';
import { wp, hp } from '../../helpers/common';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/Avatar';
import { fetchPosts } from '../../services/postService';
import PostCard from '../../components/PostCard';
import Loading from '../../components/Loading';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ProfileView = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserPosts();
    }
  }, [user, limit]);

  const fetchUser = async () => {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (data) setUser(data);
  };

  const fetchUserPosts = async () => {
    if (!hasMore || !user?.id) return;
    const res = await fetchPosts(limit, user.id);
    if (res.success) {
      if (posts.length === res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  if (!user) {
    return (
      <ScreenWrapper bg="white">
        <Loading />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={<UserHeader user={user} router={router} />}
        ListHeaderComponentStyle={{ marginBottom: 30 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item, index) => item.id.toString()}
        renderItem={({ item }) => (
          <PostCard item={item} currentUser={user} router={router} />
        )}
        onEndReached={() => setLimit((prev) => prev + 10)}
        onEndReachedThreshold={0}
        ListFooterComponent={hasMore ? (
          <View style={{ marginTop: posts.length === 0 ? 100 : 30 }}>
            <Loading />
          </View>
        ) : (
          <View style={{ marginVertical: 30 }}>
            <Text style={styles.noPosts}>No more posts</Text>
          </View>
        )}
      />
    </ScreenWrapper>
  );
};

const UserHeader = ({ user, router }) => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: wp(4) }}>
      <Header title="Profil" showBackButton={true} mb={30} />
      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
          </View>

          {/* name & lifestyle */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={styles.userName}> {user?.name} </Text>
            <Text style={styles.lifeStyleText}> {user?.lifeStyle} </Text>
          </View>

          {/* bio, username, and address */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row' }}>
              <Icon style={styles.icon} name="at" size={20} />
              <Text style={styles.infoText}> {user?.username} </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Icon style={styles.icon} name="map-marker-outline" size={20} />
              <Text style={styles.infoText}> {user?.address} </Text>
            </View>
            {user?.bio && <Text style={styles.bioText}>{user.bio}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProfileView;


const styles = StyleSheet.create({
    container: {
    flex: 1,
  },
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center',
  },
  userName: {
    fontSize: hp(3),
    fontWeight: '500',
    color: theme.colors.primary,
  },
  icon: {
    fontSize: hp(2.5),
    color: theme.colors.primary_soft,
  },
  lifeStyleText: {
    fontSize: hp(1.6),
    fontWeight: '400',
    color: theme.colors.primary,
  },
  infoText: {
    fontSize: hp(1.7),
    fontWeight: '400',
    color: theme.colors.text,
  },
  bioText: {
    fontSize: hp(1.7),
    fontWeight: '400',
    color: theme.colors.text,
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.secondary,
  },
})