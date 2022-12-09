import {body} from 'express-validator';
import validator from 'validator';
import { isEmpty } from 'lodash';
import User from '../models/user.js';
import {SpecicalCharater} from '../../constants/regex.constant.js';

const checkDuplicateUsername = async (username)=>{
    const user = await User.findOne({username}).lean();
    return isEmpty(user);
}
const checkExistSpecialCharacters=(val)=>{
    return !SpecicalCharater.test(val);
}

const checkValidPassword = (password) =>{

}
const signUp = [
    body('username').trim()
    .custom(username => validator.isLength(username,{min:6,max:20}))
    .withMessage('Username\'s length is out of range (6-20)')
    .custom(checkExistSpecialCharacters)
    .withMessage('Contain special characters')
    .bail()
    .custom(checkDuplicateUsername)
    .withMessage('Username is existed'),

    body('password')
    .custom(username => validator.isLength(username,{min:6,max:20})) 
]