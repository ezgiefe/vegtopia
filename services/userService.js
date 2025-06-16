import { supabase } from "../lib/supabase";

export const getUserData = async (userId) => {
    try{
        const {data, error} = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();
        if (error) {
          return { success: false, msg: error?.message || "Bilinmeyen bir hata oluştu." };
        }
        return { success: true, data };

        } catch (err) { 
            console.error('Exception in getUserData:', err);
            return { success: false, msg: err?.message || "Beklenmedik bir hata oluştu." }; 
        }

}

export const updateUser = async (userId, data)=>{
    try{
        const dataToUpsert = { ...data, id: userId };
        console.log('--- updateUser Debug ---');
        console.log('userId:', userId);
        console.log('data received:', data);
        console.log('dataToUpsert (sent to upsert):', dataToUpsert);
        console.log('--- End updateUser Debug ---'); 
        const { error } = await supabase
        .from('users')
        .upsert(dataToUpsert)
        .select();

        if (error) {
            console.error('Error in updateUser (upsert):', error?.message);
            return { success: false, msg: error?.message || "Bilinmeyen bir hata oluştu." };
        }
        return { success: true };
    } catch (err) { 
        console.error('Exception in updateUser (upsert):', err); 
        return { success: false, msg: err?.message || "Beklenmedik bir hata oluştu." }; 
    }
}

export const isUsernameAvailable = async (username) => {
  try {
    const { data, error } = await supabase
      .from('users') 
      .select('id') 
      .eq('username', username) // username sütunu, verilen username ile eşleşiyor mu
      .limit(1); // Eşleşen ilk kaydı bulur bulmaz dur

    if (error) {
      console.error('Error checking username availability:', error.message);
      return { success: false, msg: error.message };
    }

    // data.length === 0 ise, bu username henüz kullanılmıyor demektir.
    return { success: true, isAvailable: data.length === 0 };

  } catch (err) {
    console.error('Exception checking username availability:', err.message);
    return { success: false, msg: err.message };
  }
};

export const fetchAllUsers = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, name, image'); 

        if (error) {
            console.error('Error fetching all users:', error.message);
            return { success: false, msg: error.message };
        }
        return { success: true, data };
    } catch (err) {
        console.error('Exception fetching all users:', err.message);
        return { success: false, msg: err.message };
    }
};