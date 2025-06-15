import { supabase } from "../lib/supabase";

export const createNotification = async (notification)=>{
    try{
        
        const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

        if(error){
            console.log('notification error: ', error);
            return {success: false, msg: "Something went wrong!"};
        }
        return {success: true, data: data};

    }catch(error){
        console.log('notification error: ', error);
        return {success: false, msg: "Something went wrong!"};
    }
}

export const fetchNotifications = async (receiverId)=>{
    try{
        // we can specify the object: foreignkey (fields), eg: sender: senderId(id, name, image) or receiver: receiverId(id, name, iamge)
        const { data, error } = await supabase
        .from('notifications')
        .select(`
            *,
            sender: senderId ( id, name, image )
        `)
        .order('created_at', {ascending: false })
        .eq('receiverId', receiverId);

        if(error){
            console.log('fetchNotifications error: ', error);
            return {success: false, msg: "Could not fetch the notifications"};
        }
        return {success: true, data: data};

    }catch(error){
        console.log('fetchNotifications error: ', error);
        return {success: false, msg: "Something went wrong!"};
    }
}

export const fetchUnreadNotificationCount = async (userId) => {
    try {
        const { count, error } = await supabase
            .from('notifications') 
            .select('*', { count: 'exact', head: true }) 
            .eq('receiverId', userId) 
            .eq('is_read', false); 

        if (error) {
            console.error('Error fetching unread notification count:', error);
            return { success: false, msg: error.message };
        }

        return { success: true, data: count };

    } catch (err) {
        console.error('Exception fetching unread notification count:', err);
        return { success: false, msg: err.message };
    }
}

export const markNotificationsAsRead = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true }) 
            .eq('receiverId', userId) 
            .eq('is_read', false); 

        if (error) {
            console.error('Error marking notifications as read:', error);
            return { success: false, msg: error.message };
        }
        return { success: true, data };
    } catch (err) {
        console.error('Exception marking notifications as read:', err);
        return { success: false, msg: err.message };
    }
}