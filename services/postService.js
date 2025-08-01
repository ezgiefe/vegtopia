import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdatePost = async (post)=>{
    try{
        // create or update
        if(post.file && typeof post.file == 'object'){
            let isImage = post?.file?.type=='image';
            let folderName = isImage? 'postImages': 'postVideos';
            let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);
            if(fileResult.success) post.file = fileResult.data;
            else {
                return fileResult;
            }
        }
        
        const { data, error } = await supabase
        .from('posts')
        .upsert(post)
        .select()
        .single();
 
        if(error){
            console.log('createPost error: ', error);
            return {success: false, msg: "Could not create your post"};
        }
        return {success: true, data: data};

    }catch(error){
        console.log('createPost error: ', error);
        return {success: false, msg: "Could not create your post"};
    }
}


export const fetchPosts = async (limit = 10, userId = null) => {
    try {
        let query = supabase
            .from('posts')
            .select(`
                *,
                user: users (id, name, username, image, lifeStyle), 
                postLikes (*),
                comments (count)
            `)
            .order('created_at', { ascending: false });

        if (userId) { 
            query = query.eq('userId', userId);
        }

        query = query.limit(limit); 

        const { data, error } = await query; 

        if (error) {
            console.error('fetchPosts error:', error); 
            return { success: false, msg: error.message || "Gönderiler çekilemedi." }; 
        }
        return { success: true, data: data };

    } catch (err) {
        console.error('Exception in fetchPosts:', err.message);
        return { success: false, msg: err.message || "Beklenmedik bir hata oluştu." };
    }
};
        

export const fetchPostDetails = async (postId)=>{
    try{
        const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            user: users ( id, name, image ),
            postLikes (*),
            comments (*, user: users(id, name, image))
        `)
        .eq('id', postId)
        .single();

        

        if(error){
            console.log('postDetails error: ', error);
            return {success: false, msg: "Could not fetch the post"};
        }
        return {success: true, data: data};

    }catch(error){
        console.log('postDetails error: ', error);
        return {success: false, msg: "Could not fetch the post"};
    }
}

export const createPostLike = async (postLike)=>{
    try{
        
        const { data, error } = await supabase
        .from('postLikes')
        .insert(postLike)
        .select()
        .single();

        if(error){
            console.log('postLike error: ', error);
            return {success: false, msg: "Could not like this post"};
        }
        return {success: true, data: data};

    }catch(error){
        console.log('postLike error: ', error);
        return {success: false, msg: "Could not like this post"};
    }
}
export const removePostLike = async (postId, userId)=>{
    try{
        
        const { error } = await supabase
        .from('postLikes')
        .delete()
        .eq('userId', userId)
        .eq('postId', postId)

        if(error){
            console.log('postLike error: ', error);
            return {success: false, msg: "Could not remove post like"};
        }
        return {success: true, data: {postId, userId}};

    }catch(error){
        console.log('postLike error: ', error);
        return {success: false, msg: "Could not remove post like"};
    }
}


export const createComment = async (comment)=>{
    try{
        
        const { data, error } = await supabase
        .from('comments')
        .insert(comment)
        .select()
        .single();

        if(error){
            console.log('comment error: ', error);
            return {success: false, msg: "Could not create your comment"};
        }
        return {success: true, data: data};

    }catch(error){
        console.log('comment error: ', error);
        return {success: false, msg: "Could not create your comment"};
    }
}


export const removeComment = async (commentId)=>{
    try{
        
        const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

        if(error){
            console.log('removeComment error: ', error);
            return {success: false, msg: "Could not remove the comment"};
        }
        return {success: true, data: {commentId}};

    }catch(error){
        console.log('removeComment error: ', error);
        return {success: false, msg: "Could not remove the comment"};
    }
}

export const removePost = async (postId)=>{
    try{
        
        const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

        if(error){
            console.log('removePost error: ', error);
            return {success: false, msg: "Could not remove the post"};
        }
        return {success: true, data: {postId}};

    }catch(error){
        console.log('removePost error: ', error);
        return {success: false, msg: "Could not remove the post"};
    }
}