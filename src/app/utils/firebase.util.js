import firebaseAdmin from 'firebase-admin';
import { firebase_key } from '../../../configs/config.js';

const BUCKET = "maskstore-abf18.appspot.com";

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebase_key),
    storageBucket: BUCKET
})

const bucket = firebaseAdmin.storage().bucket();

export const uploadFileToFireBase = (file,fileName) => new Promise((resolve,reject) => {
    const bucketFile = bucket.file(fileName);
    const stream = bucketFile.createWriteStream({
        metadata: {
            contentType: file.mimetype
        }
    });
    stream.on("error",e=>{
        reject(e)
    });
    stream.on("finish",async e=>{
        await bucketFile.makePublic();
        resolve(`https://storage.googleapis.com/${BUCKET}/${fileName}`);
    });
    stream.end(file.buffer);
})
export const deleteFileFromFirebase = (fileName) => new Promise((resolve,reject)=>{
    const bucketFile = bucket.file(fileName);
    bucketFile.delete({ignoreNotFound:true})
    .then(rs=>resolve(true))
    .catch(err=>reject(false))
})
