import crypto from 'crypto-js';
const key='key';

const encrypt = (text) => crypto.AES.encrypt(text,key).toString();
const decrypt = (text) => crypto.AES.decrypt(text,key).toString(crypto.enc.Utf8);
export {
    encrypt,
    decrypt
}