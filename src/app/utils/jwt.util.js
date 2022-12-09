import jwt from 'jsonwebtoken';
import {secretKey,expiresIn,expiresIn_refresh} from '../../constants/credential.constant.js';

const refresh = (token,refreshToken)=>{
    try {
        const tokenDecode = jwt.verify(token,secretKey,{ignoreExpiration:true});
        const refreshDecode = jwt.verify(refreshToken,secretKey);
        if (tokenDecode.toString() === refreshDecode.toString()){
            delete tokenDecode['iat'];
            delete tokenDecode['exp'];
            const renewToken = sign(tokenDecode);
            const renewRefreshToken = sign_refresh(tokenDecode);
            return {token: renewToken, refreshToken: renewRefreshToken, _id:tokenDecode._id};
        } 
        
        return null;
    } catch (error) {
        return null;
    }
     
}
const sign = (model) => jwt.sign(model,secretKey,{expiresIn});
const sign_refresh = (model) => jwt.sign(model,secretKey,{expiresIn:expiresIn_refresh});
const verify = (token, optional = {ignoreExpiration: false}) => jwt.verify(token,secretKey,optional);
const {JsonWebTokenError,TokenExpiredError} = jwt;
export default {
    refresh,
    sign,
    sign_refresh,
    verify,
    JsonWebTokenError,
    TokenExpiredError
}