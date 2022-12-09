import Validation from '../utils/test.util.js';
import validator from 'validator';
import {SpecicalCharater} from '../../constants/regex.constant.js';
import jwt from 'jsonwebtoken';
import { uploadFileToFireBase,deleteFileFromFirebase } from '../utils/firebase.util.js';
import Product from '../models/product.js';
import Category from '../models/category.js';
import statusCode from 'http-status-codes';
import _ from 'lodash';
import { sendOTP } from '../utils/twilio.util.js';
import { generateVerifyCode } from '../utils/generateCode.util.js';
import { sendMail } from '../utils/mail.util.js';
//import {getStorage, ref, uploadBytes} from 'firebase/storage';
// import {getStorage} from 'firebase-admin/storage'
// import {storage} from 'firebase-admin'
// export default async (req,res)=>{
//     try {

//         const fileUrl = await uploadFileToFireBase(req.file,new Date().getTime()+"."+req.file.originalname.split('.').pop());
//         console.log(fileUrl);
//         res.status(200).send();
        
//     } catch (error) {
//         console.log(error)
//         res.status(500).send()
//     }
    
// }

export default  async (req,res) => {
    try {
        // const {phone} = req.body;
        // const smsRes = await sendOTP({phone,otp:generateVerifyCode()});
        const {email} = req.body;
        const emailRes = await sendMail({to: email, subject: "Test", html: '<div style="display: inline-block; background-color: green; text-align: center;"><h3>Navita</h3<p>Test Send Email</p></div>'})
        return res.status(statusCode.OK).json({
            data: emailRes,
            message: 'Get successfully'
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            message: error
        })
    }
        
}