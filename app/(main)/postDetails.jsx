import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import Loading from '../../components/Loading';
import PostCard from '../../components/PostCard'
import Input from '../../components/Input';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CommentItem from '../../components/CommentItem';
import { supabase } from '../../lib/supabase';
import { createComment, fetchPostDetails, removeComment, removePost } from '../../services/postService';
import { createNotification } from '../../services/notificationService';
import { getUserData } from '../../services/userService';

const PostDetails = () => {
    const {postId, commentId} = useLocalSearchParams();
    const [post, setPost] = useState(null);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {user} = useAuth();  
    const commentRef = useRef("");
    const inputRef = useRef(null);
    const [startLoading, setStartLoading] = useState(true);

    //console.log('got postId: ', postId);
    const handleNewComment = async payload=>{
        console.log('got new comment: ', payload.new)
        if(payload.new){
            let newComment = {...payload.new};
            let res = await getUserData(newComment.userId);
            newComment.user = res.success? res.data: {};
            setPost(prev=> {
                return {
                    ...prev,
                    comments: [newComment, ...prev.comments]
                }
            });
        }
    }

    useEffect(()=>{
        //console.log('PostDetails received postId:', postId);
        getPostDetails();

        let channel = supabase
        .channel('comments')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'comments',
            filter: `postId=eq.${postId}`,
        }, handleNewComment)
        .subscribe(); 

        return ()=>{
            supabase.removeChannel(channel)
        }
    },[]);

    const getPostDetails = async ()=>{
        let res = await fetchPostDetails(postId);
        //console.log('res: ', res);        
        if(res.success) {
        setPost(res.data);
        //console.log('Successfully fetched post data:', res.data); 
        } else {
        //console.error('Failed to fetch post details:', res.msg); 
        }
        setStartLoading(false);
    }

    const onNewComment = async ()=>{
        if(!commentRef.current) return null;
        let data = {
            userId: user?.id,
            postId: post?.id,
            text: commentRef.current,
        };

        setLoading(true);
        let res = await createComment(data);
        setLoading(false);
        // console.log('result: ', res);
        if(res.success){
            if(user.id!=post.userId){
                let notify = {
                    senderId: user.id,
                    receiverId: post.userId,
                    title: 'postuna yorum yaptı',
                    data: JSON.stringify({postId: post.id, commentID: res?.data?.id})
                }
                createNotification(notify); 
            }

            inputRef?.current?.clear();
            commentRef.current="";
        }else{
            Alert.alert('Yorum', res.msg);
        }
    }

    const onDeleteComment = async (comment)=>{
        let res = await removeComment(comment.id);
        if(res.success){
            setPost(prevPost=>{
                let updatedPost = {...prevPost};
                updatedPost.comments = updatedPost.comments.filter(c=> c.id != comment.id);
                return updatedPost;
            })
        }else{
            Alert.alert('Yorum', res.msg);
        }
    }

    const onDeletePost = async ()=>{
        let res = await removePost(post.id);
        if(res.success){
            router.back();
        }else{
            Alert.alert('Post', res.msg);
        }
    }
    const onEditPost = async ()=>{
        router.back();
        router.push({pathname: 'newPost', params: {...post}});
        
    }

    if(startLoading){
        return (
            <View style={styles.center}>
                <Loading />
            </View>
        )
    }

    if(!post){
        return (
            <View style={[styles.center, {justifyContent: 'flex-start', marginTop: 100}]}>
                <Text style={styles.notFound}>Post bulunamadı!</Text>
            </View>     
        )  
    }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        <PostCard
                item={{...post, comments: [{count: post?.comments?.length}]}} 
                currentUser={user}
                router={router} 
                showMoreIcon={false}
                hasShadow={false}
                showDelete={true}
                onDelete={onDeletePost}
                onEdit={onEditPost}
            />

            {/* comment input */}
            <View style={styles.inputContainer}>
                <Input
                    inputRef={inputRef}
                    placeholder='Yorum yaz...'
                    placeholderTextColor={theme.colors.textLight}
                    onChangeText={value=> commentRef.current=value}
                    containerStyles={{flex: 1, height: hp(6.2), borderRadius: theme.radius.xl}}
                />

                {
                    loading? (
                        <View style={styles.loading}>
                            <Loading size="small" />
                        </View>
                    ):(
                        <TouchableOpacity onPress={onNewComment} style={styles.sendIcon}>
                            <Icon name="send" color={theme.colors.secondary} />
                        </TouchableOpacity>
                    )
                }
                
            </View>

            {/* comment list */}
            <View style={{marginVertical: 15, gap: 17}}>
                {
                    post?.comments?.map(comment=> 
                        <CommentItem 
                                item={comment} 
                                canDelete={user.id==comment.userId || user.id==post.userId}
                                onDelete={onDeleteComment}
                                key={comment.id.toString()} 
                                highlight={comment.id==commentId}
                        />
                    )
                }
                {
                    post?.comments?.length==0 && (
                        <Text style={{color: theme.colors.text, marginLeft: 5,}}>Yorum yapan ilk kişi ol!</Text>
                    )
                }
            </View>
      </ScrollView>
    </View>    
  )
}

export default PostDetails

const styles = StyleSheet.create({
  container: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: wp(7),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    list: {
        paddingHorizontal: wp(4),
    },
    sendIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8)
    },
    center: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    notFound: {
        fontSize: hp(2.5),
        color: theme.colors.text,
        fontWeight: theme.fonts.medium,
    },
    loading: {
        height: hp(5.8), 
        width: hp(5.8), 
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{scale: 1.3}]
    }
})