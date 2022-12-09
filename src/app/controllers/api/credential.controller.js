import User from '../../models/user.js';
import bcryptjs from 'bcryptjs';
import {decrypt, encrypt} from '../../utils/crypto.util.js';
import jwt from '../../utils/jwt.util.js';
// import JSEncrypt from 'node-jsencrypt';
import {hashLen,roles} from '../../../constants/credential.constant.js';
import statusCode from 'http-status-codes';
import { generateVerifyCode } from '../../utils/generateCode.util.js';
import { sendOTP } from '../../utils/twilio.util.js';

const VERIFY_CODE_EXPIRED_IN = 60;
const VERIFY_RESET_PASSWORD_CODE_EXPIRED_IN = 60*10;
const VERIFY_RESET_PASSWORD_TOKEN_EXPIRED_IN = 60*60;
const SIGN_UP_TOKEN_EXPIRED_IN = 60*60;



const signUser = (user)=> {
    const {_id,phoneNumber,role} = user;
    return {
        token: jwt.sign({_id,phoneNumber,role}), 
        refresh: jwt.sign_refresh({_id,phoneNumber,role})
    }
}
const getVerifyCode = (phoneNumber) => {        
    const verifyCode = generateVerifyCode();
    // global.redisClient.setEx(phoneNumber,VERIFY_CODE_EXPIRED_IN, verifyCode);
    global.nodeCache.set(phoneNumber,verifyCode,VERIFY_CODE_EXPIRED_IN);
    return verifyCode;
}
const getVerifyResetPasswordCode = (phoneNumber,password)=>{
    const verifyCode = generateVerifyCode();
    //global.redisClient.setEx("resetpw"+phoneNumber,60*10,verifyCode);
    global.nodeCache.set(`resetpw${phoneNumber}`,verifyCode,VERIFY_RESET_PASSWORD_CODE_EXPIRED_IN);
    return verifyCode;
}
const getResetPasswordToken = (phoneNumber,password) => {
    const resetPasswordToken = encrypt(password);
    //global.redisClient.setEx("resetpwtoken"+phoneNumber,60*60,resetPasswordToken);
    global.nodeCache.set(`resetpwtoken${phoneNumber}`,resetPasswordToken,VERIFY_RESET_PASSWORD_TOKEN_EXPIRED_IN);
    return resetPasswordToken;
}
const refreshVerifyCode = async (req, res) => {
    try {
        const {phoneNumber}  = req.query;
        const verifyCode = getVerifyCode(phoneNumber);
        const {message} = await sendOTP({phone: phoneNumber, otp: verifyCode});
        return res.status(statusCode.OK).json({
            payload: {
                timer: VERIFY_CODE_EXPIRED_IN
            },
            message
        }).send();
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
const verifyCode = async (req, res) => {
    try {
        const {verifyCode, phoneNumber} = req.body;
        //const rs = await global.redisClient.get(phoneNumber);
        const rs = global.nodeCache.get(phoneNumber);
        if(rs){
            if(verifyCode === rs){
                //generate signUpToken
                const signUpToken = (new Date().getTime()).toString();
                //global.redisClient.setEx("signup"+phoneNumber, 60*60, signUpToken)
                global.nodeCache.set(`signup${phoneNumber}`,signUpToken,SIGN_UP_TOKEN_EXPIRED_IN);
                return res.status(statusCode.OK).json({
                    payload: {signUpToken}
                }).send();
            }else{
                return res.status(statusCode.METHOD_FAILURE).json({
                    message: "Wrong verify code"
                }).send();
            }
        }else {
            //const newVerifyCode = getVerifyCode(phoneNumber);
            //re-send sms api
            return res.status(statusCode.METHOD_FAILURE).json({
                message: "Verify code has been expired",
                payload: {
                    // verifyCode: newVerifyCode,
                    // timer: 60
                }
            }).send();
        }         
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
const signUp = async (req,res)=>{
    try {
        const {phoneNumber,signUpToken,password,name} = req.body;
        const user = await User.findOne({phoneNumber}).lean();
        if (user == null){
            if(signUpToken){
                //const rs = await global.redisClient.get("signup"+phoneNumber);
                const rs = global.nodeCache.get(`signup${phoneNumber}`);
                if(rs === signUpToken){
                    User.create({
                        name,
                        phoneNumber: phoneNumber,
                        password: bcryptjs.hashSync(decrypt(password),hashLen),
                        //password,
                        order: [],
                        favorite: [],
                        notification:[],
                        role: roles.CUSTOMER,
                        gender: undefined, 
                        dateOfBirth: undefined,
                        image: undefined,
                        deliveryAddress: [],
                        message: [],
                        status: true
                    }).then(()=> res.status(statusCode.OK).json({
                        message: "Sign up successfully"
                    }).send())
                }else return res.status(statusCode.METHOD_FAILURE).send();                
            }else{
                //const rs = await global.redisClient.get(phoneNumber);
                const rs = global.nodeCache.get(phoneNumber);
                if(rs){
                    return res.status(statusCode.METHOD_FAILURE).json({
                        message: "Phone number has been processing"
                    })
                }else {
                    const verifyCode = getVerifyCode(phoneNumber);
                    const {message} = await sendOTP({phone: phoneNumber, otp: verifyCode});
                    //send sms api
                    return res.status(statusCode.OK).json({
                        payload: {
                            timer: VERIFY_CODE_EXPIRED_IN
                        },
                        message
                    }).send();
                }               
            }
        }else{
            return res.status(statusCode.METHOD_FAILURE).json({
                message: "Phone number has been used"
            })
        }        
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
const signIn = async (req,res) => {
    try {
        let {phoneNumber,password} = req.body;
        password = decrypt(password);
        const user = await User.findOne({phoneNumber}).lean();
        if(bcryptjs.compareSync(password,user.password)){
            const {token,refresh} = signUser(user);
            let payload={user,token,refresh};
            if(user.role === roles.CUSTOMER){
                const admin = await User.findOne({role:roles.ADMIN}).select('_id name').lean();
                payload = {...payload, admin}
            }
            res.status(statusCode.OK).json({
               payload
            })
        }else return res.status(statusCode.UNAUTHORIZED).send();

    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
const signInToken = async (req,res) => {
    try {
        let {payload,user} = req;
        payload = {...payload, user};
        if (user.role === roles.CUSTOMER) {
            const admin = await User.findOne({role:roles.ADMIN}).select('_id name').lean();
            payload = {...payload, admin}
        }
        return res.status(statusCode.OK).json({
            payload
        })
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
const signOut = () =>{

}

const refreshToken = async (req,res) => {
    try{
        const {token,refreshToken} = req.body;
        const rs = jwt.refresh(token,refreshToken);
        if(rs){
            const {token, refreshToken} = rs;
            return res.status(statusCode.OK).json({
                payload: {
                    //user,
                    token,
                    refreshToken
                }
            })
        }else return res.status(statusCode.METHOD_FAILURE).send();
    }catch (error){
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}

const forgotPassword = async (req,res)=>{
    try {
        const {phoneNumber,resetPasswordToken,newPassword} = req.body;
        const user = await User.findOne({phoneNumber});
        if (user!=null){
            if(resetPasswordToken){
                //const rs = await global.redisClient.get("resetpwtoken"+phoneNumber);
                const rs = global.nodeCache.get(`resetpwtoken${phoneNumber}`);
                if(resetPasswordToken === rs){
                    user.password = bcryptjs.hashSync(decrypt(newPassword),hashLen);
                    await user.save();
                    return res.status(statusCode.OK).send();
                }else return res.status(statusCode.METHOD_FAILURE).json({
                    message: "Fail to reset password. Try again"
                }).send();
            }else{
                const verifyCode = getVerifyResetPasswordCode(phoneNumber);
                const {message} = await sendOTP({phone: phoneNumber, otp: verifyCode});
                getResetPasswordToken(phoneNumber,user.password);
                return res.status(statusCode.OK).json({
                    payload: {
                        timer: VERIFY_CODE_EXPIRED_IN
                    },
                    message
                }).send();
            }            
        }else{
            return res.status(statusCode.METHOD_FAILURE).json({
                message: "Phone number has not been exist in system"
            }).send()
        }        
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
const verifyForgotPasswordCode = async (req,res) => {
    try {
        const {verifyCode,phoneNumber} = req.body;
        //const rs = await global.redisClient.get("resetpw"+phoneNumber);
        const rs = global.nodeCache.get(`resetpw${phoneNumber}`);
        if(rs){
            if(verifyCode === rs){
                // const resetPasswordToken = encrypt(password);
                // global.redisClient.setEx("resetpwtoken"+phoneNumber,60*10,resetPasswordToken)
                return res.status(statusCode.OK).json({
                    payload: {
                        //resetPasswordToken: await global.redisClient.get("resetpwtoken"+phoneNumber)
                        resetPasswordToken: global.nodeCache.get(`resetpwtoken${phoneNumber}`)
                    }
                }).send();
            }else{
                return res.status(statusCode.METHOD_FAILURE).json({
                    message: "Wrong verify code"
                }).send();
            }
        }else {
            const newVerifyCode = getVerifyResetPasswordCode(phoneNumber);
            const {message} = await sendOTP({phone: phoneNumber, otp: newVerifyCode});
            return res.status(statusCode.METHOD_FAILURE).json({
                message: "Verify code has been expired",
                    payload: {
                        timer: VERIFY_CODE_EXPIRED_IN
                    },
                    message
            }).send();
        }
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
const refreshVerifyForgotPasswordCode = async (req,res) => {
    try {
        const {phoneNumber} =req.query;
        const newVerifyCode = getVerifyResetPasswordCode(phoneNumber);
        const {message} = await sendOTP({phone: phoneNumber, otp: newVerifyCode});
            return res.status(statusCode.OK).json({
                message: "Verify code has been expired",
                    payload: {
                        timer: VERIFY_CODE_EXPIRED_IN
                    },
                    message
            }).send();
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}
const resetPassword = async (req,res) => {
    try {
        const {oldPassword, newPassword} = req.body;
        const user = await User.findById(req.user._id);
        if(bcryptjs.compareSync(decrypt(oldPassword,user.password))){
            user.password = bcryptjs.hashSync(decrypt(newPassword),hashLen);
            await user.save();
            return res.status(statusCode.OK).json({
                message: 'Reset password successfully'
            })
        }else return res.status(statusCode.METHOD_FAILURE).json({
            message: 'Wrong password'
        }).send();
        
    } catch (error) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send();
    }
}

export default {
    signUp,
    signIn,
    signOut,
    signInToken,
    refreshToken,
    verifyCode,
    refreshVerifyCode,
    verifyForgotPasswordCode,
    forgotPassword,
    refreshVerifyForgotPasswordCode,
    resetPassword
}