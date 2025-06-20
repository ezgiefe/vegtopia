import { Alert, Button, FlatList, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { supabase } from '../../lib/supabase'
import { getUserData } from '../../services/userService'
import { fetchPosts } from '../../services/postService'
import { fetchUnreadNotificationCount } from '../../services/notificationService'

var limit = 0;
const Home = () => {

    const {user, setAuth} = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [notificationCount, setNotificationCount] = useState(0);

    const handlePostEvent = async (payload)=>{
      //console.log('got post event: ', payload);
      if(payload.eventType == 'INSERT' && payload?.new?.id){
        let newPost = {...payload.new};
        let res = await getUserData(newPost.userId);
        newPost.user = res.success? res.data: {};
        newPost.postLikes = []; 
        newPost.comments = [{count: 0}] 
        setPosts(prevPosts=> [newPost, ...prevPosts]);
      }

      if(payload.eventType == 'DELETE' && payload?.old?.id){
        setPosts(prevPosts=> {
          let updatedPosts = prevPosts.filter(post=> post.id!=payload.old.id);
          return updatedPosts;
        })
      }

      if(payload.eventType == 'UPDATE' && payload?.new?.id){
        setPosts(prevPosts=> {
          let updatedPosts = prevPosts.map(post=> {
            if(post.id==payload.new.id){
              post.body = payload.new.body;
              post.file = payload.new.file;
            }
            return post;
          });
          return updatedPosts;
        })
      }
    }

    const handleNewNotification = payload=>{
      console.log('got new notification : ', payload);
      if(payload.eventType=='INSERT' && payload?.new?.id){
        setNotificationCount(prev=> prev+1);
      }
    }

    useEffect(()=>{
      let postChannel = supabase
      .channel('posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, handlePostEvent)
      .subscribe();

      let notificationChannel;
        if (user?.id) { 
          const getInitialNotificationCount = async () => {
              const res = await fetchUnreadNotificationCount(user.id);
              if (res.success) {
                  setNotificationCount(res.data); 
              }
          };
          getInitialNotificationCount(); 

          notificationChannel = supabase
              .channel('notifications')
              .on('postgres_changes', { 
                  event: 'INSERT', 
                  schema: 'public', 
                  table: 'notifications', 
                  filter: `receiverId=eq.${user.id}`, 
              }, handleNewNotification)
              .subscribe();
        }

      return () => {
        supabase.removeChannel(postChannel);
        if (notificationChannel) {
            supabase.removeChannel(notificationChannel);
        }
      };
    }, [user?.id]);

    const getPosts = async ()=>{
      if(!hasMore) return null; 
      limit = limit+10; 
      console.log('fetching posts: ', limit);
      let res = await fetchPosts(limit);
       if(res.success){
       if(posts.length==res.data.length) setHasMore(false);
       setPosts(res.data);
       }
    }

  return (
    <ScreenWrapper bg="white">
      <View style= {styles.container}>

        {/* header */}
        <View style={styles.header}>
          <View style={styles.leftside}>
            <Pressable>
              <Text style={styles.title}>Vegtopia</Text>
            </Pressable>
            <Pressable onPress={() => router.push('search')}>
                <Icon name="magnify" size={hp(3.2)} color={theme.colors.primary} style={styles.searchButton} />
            </Pressable>
          </View>
          
          <View style={styles.rightside}>
            <Pressable onPress={() => {
              setNotificationCount(0);
              router.push('notifications');
            }}>
              <Icon name="heart" size={hp(3.2)} strokeWidth={2} color= {theme.colors.primary} />
              {
                notificationCount>0 && (
                  <View style={styles.pill}>
                    <Text style={styles.pillText}>{notificationCount}</Text>
                  </View>
                )
              }
            </Pressable>
            <Pressable onPress={() => router.push('newPost')}>
              <Icon name="plus" size={hp(3.2)} color= {theme.colors.primary} />
            </Pressable>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar
              uri={user?.image}
              size={hp(4.3)}
              rounded={theme.radius.sm}
              style={{borderWidth: 2}}
              />
            </Pressable>
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item, index) => item.id.toString()}
          renderItem={({ item }) => <PostCard 
            item={item} 
            currentUser={user}
            router={router} 
            />
          }
          onEndReached={() => {
            getPosts();
            console.log('Sona geldiniz! :)');
          }}
          onEndReachedThreshold={0} 
          ListFooterComponent={hasMore? (
              <View style={{marginVertical: posts.length==0? 200: 30}}>
                <Loading />
              </View>
            ):(
              <View style={{marginVertical: 30}}>
                <Text style={styles.noPosts}>Akıştaki postlar bu kadar...</Text>
              </View>
            )
          }          
        />
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container:{
    flex:1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4)
  },
  leftside: {
    flexDirection: 'row',
    
  },
  title: {
    color: theme.colors.primary,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold
  },
  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
    borderWidth: 3
  },
  rightside: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18
  },
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4)
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.secondary
  },
  pill: {
    position: 'absolute',
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight
  },
  pillText: {
    color: 'white',
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold
  },
  searchButton: {
    marginLeft: 10,
    marginTop: 5
  }
})