export const validateUsername = (username) => {
    if (!username || username.length < 4) {
        return { isValid: false, message: 'Kullanıcı adı en az 4 karakter olmalı.' };
    }
    if (username.length > 20) {
        return { isValid: false, message: 'Kullanıcı adı en fazla 20 karakter olmalı.' };
    }
    
    if (/\s/.test(username)) {
        return { isValid: false, message: 'Kullanıcı adı boşluk içeremez.' };
    }

    // sadece harf, rakam, alt çizgi, tire ve nokta içerebilir.
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        return { isValid: false, message: 'Kullanıcı adı sadece harf, rakam, alt çizgi(_), tire(-) ve nokta(.) içerebilir.' };
    }
    // kullanıcı adı sadece _ veya . ile başlayamaz/bitemez
    if (/^[_. -]/.test(username) || /[_. -]$/.test(username)) {
      return { isValid: false, message: 'Kullanıcı adı alt çizgi, tire veya nokta ile başlayıp bitemez.' };
    }

    return { isValid: true, message: '' };
}; 

export const validateEmail = (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { isValid: false, message: 'Geçerli bir e-posta adresi girin.' };
    }
    return { isValid: true, message: '' };
};

export const validatePassword = (password) => {
    if (!password || password.length < 6) {return { isValid: false, message: 'Şifre en az 6 karakter olmalı.' };}
    if (!/[A-Z]/.test(password)) return { isValid: false, message: 'Şifre en az bir büyük harf içermeli.' };
    if (!/[0-9]/.test(password)) return { isValid: false, message: 'Şifre en az bir rakam içermeli.' };
    if (!/[!@#$%^&*().]/.test(password)) return { isValid: false, message: 'Şifre en az bir özel karakter içermeli.' };
    return { isValid: true, message: '' };
};