import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import { theme } from '../../constants/theme'
import Header from '../../components/Header'
import { wp, hp } from '../../helpers/common'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'

var limit = 0;
const Profile = () => {
  const {user, setAuth} = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
    
  const getPosts = async ()=>{
    if(!hasMore) return null; 
    limit = limit+10; 
    console.log('fetching posts: ', limit);
    let res = await fetchPosts(limit, user.id);
    if(res.success){
      if(posts.length==res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  }

  const onLogout = async () => {
    const {error} = await supabase.auth.signOut();
    
    if(error){
        Alert.alert('Sign out', "Error signing out!");
    }
  }

        const handleLogout = async () => {
        //show confirm modal
        Alert.alert('Confirm', "Are you sure you want to logout?", [
            {
                text: 'Cancel',
                onPress: () => console.log('modal cancelled'),
                style: 'cancel'
            },
            {
                text: 'Logout',
                onPress: () => onLogout(),
                style: 'destructive'
            }
        ])
    }

  return (
    <ScreenWrapper bg='white'>
      <FlatList
        data={posts}
        ListHeaderComponent={<UserHeader user={user} handleLogout={handleLogout} router={router} />}
        ListHeaderComponentStyle={{marginBottom: 30}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item, index) => item.id.toString()}
        renderItem={({ item }) => <PostCard 
          item={item} 
          currentUser={user}
          router={router} 
        />}
        onEndReached={() => {
          getPosts();
          console.log('got to the end');
        }}
        onEndReachedThreshold={0} 
        ListFooterComponent={hasMore? (
            <View style={{marginTop: posts.length==0? 100: 30}}>
              <Loading />
            </View>
          ):(
            <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  )
}

const UserHeader = ({user, router, handleLogout}) => {
    return (
        <View style= {{flex:1, backgroundColor: 'white', paddingHorizontal:wp(4)}}>
            <View>
               <Header title= 'Profil' showBackButton={true} mb={30} />
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={hp(3.2)} color= {theme.colors.primary} />
                </TouchableOpacity> 
            </View>

            <View style= {styles.container}>
                <View style={{gap: 15}}>
                    {/* avatar */}
                    <View style={styles.avatarContainer}>
                        <Avatar
                        uri={user?.image}
                        size={hp(12)}
                        rounded={theme.radius.xxl*1.4}
                        />
                        <Pressable style={styles.editIcon} onPress={()=> router.push('/editProfile')}>
                            <Icon name="pencil-outline" strokeWidth={2.5} size={20} style={{color: theme.colors.secondary}} />
                        </Pressable>
                    </View>

                    {/* name & lifeSytle */}
                    <View style={{alignItems: 'center', gap: 4}}>
                        <Text style={styles.userName}> { user && user.name } </Text>
                        <Text style={styles.lifeStyleText}> {user && user.lifeStyle} </Text>
                    </View>

                    {/* bio, username and address */}
                    <View style={{gap: 10}}>
                      <View style= {{flexDirection: 'row'}}>
                        <Icon style={styles.icon} name="at" strokeWidth={2.5} size={20} />
                        <Text style={styles.infoText}> {user && user.username} </Text>
                      </View>
                      <View style= {{flexDirection: 'row'}}>
                        <Icon style={styles.icon} name="map-marker-outline" strokeWidth={2.5} size={20} />
                        <Text style={styles.infoText}> {user && user.address} </Text>
                      </View>
                      
                      
                        {
                            user && user.bio && (
                            <Text style={[styles.bioText]}>{user.bio}</Text>
                            )
                        }                
                    </View>
                </View>               
            </View>            
        </View>        
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
    flex: 1,
  },
  headerContainer: {
    marginHorizontal: wp(4), 
    marginBottom: 20
  },
  headerShape: {
    width: wp(100),
    height: hp(20)
  },  
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: 'center'
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: 'white',
    shadowColor: theme.colors.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7
  },
  userName: {
    fontSize: hp(3),
    fontWeight: '500',
    color: theme.colors.primary
  },
  icon:{
    fontSize: hp(2.5),
    color: theme.colors.primary_soft
  },
  // info: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 10,
  // },
  lifeStyleText: {
    fontSize: hp(1.6),
    fontWeight: '400',  
    color: theme.colors.primary
  },
  infoText: {
    fontSize: hp(1.7),
    fontWeight: '400',
    color: theme.colors.text
  },
  bioText: {
    fontSize: hp(1.7),
    fontWeight: '400',
    color: theme.colors.text
  },

  logoutButton: {
    position: 'absolute',
    right: 0,
    padding: 5
  },
  listStyle: {
    paddingHorizontal: wp(4),
    paddingBottom: 30,

  },
  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.secondary
  },
  

})