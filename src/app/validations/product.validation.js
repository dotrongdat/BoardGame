import {body,query,check} from 'express-validator';
import {sortFields} from '../../constants/product.constant.js';
import {SpecicalCharater} from '../../constants/regex.constant.js'
import validator from 'validator';

const checkExistSpecialCharacters=(val)=>{
   return !SpecicalCharater.test(val);
}
const checkValidExtensionFile=(val)=>{
    const ext=path.extname(val.originalname);
    return validExtensionFile.includes(ext);
}
const search=[
    // query('name')
    // .custom(checkExistSpecialCharacters)
    // .withMessage('Contain special characters'),
    
    query('inc')
    .if(query('inc').exists())
    .custom(value=> (value==='true'||value==='false'))
    .withMessage('Invalid value'),
    
    query('sortBy')
    .if(query('sortBy').exists())
    .custom(value => sortFields.includes(value))
    .withMessage('Invalid value')
]

const create=[
    // check('file')
    // .exists()
    // .withMessage('Empty')
    // .bail()
    // .custom(checkValidExtensionFile)
    // .withMessage('Invalid file extension'),

    body('name')
    .notEmpty({ignore_whitespace:true})
    .withMessage('Empty'),
    // .custom(checkExistSpecialCharacters)
    // .withMessage('Contain special characters'),

    body('description')
    .exists()
    .custom(value=> validator.isLength(value,{min:0,max:2000}))
    .withMessage('Out of range (less than or equal to 2000 letters)')
    //.custom(checkExistSpecialCharacters)
    //.withMessage('Contain special characters'),
    
    ,body('quantity')
    .custom(value => validator.isInt(value, {min: 0, max:1000000}))
    .withMessage('Out of range (0 - 1 000 000)'),

    body('price')
    .custom(value => validator.isInt(value, {gt: 0, max: 1000000000000}))
    .withMessage('Out of range (1 - 1 000 000 000 000)'),

]

const update=[
    // check('imageFile','Invalid file extension')
    // .if(check('imageFile').exists())
    // .custom(checkValidExtensionFile)
    // .withMessage('Invalid file extension'),

    body('name')
    .notEmpty({ignore_whitespace : true})
    .withMessage('Empty'),
    // .custom(checkExistSpecialCharacters)
    // .withMessage('Contain special characters'),

    body('description')
    .exists()
    .custom(value=> validator.isLength(value,{min:0,max:2000}))
    .withMessage('Out of range (less than or equal to 2000 letters)')
    //.custom(checkExistSpecialCharacters)
    //.withMessage('Contain special characters'),

    ,body('quantity')
    .custom(value => validator.isInt(value, {min: 0, max:1000000}))
    .withMessage('Out of range (0 - 1 000 000)'),

    // body('publishedYear')
    // .custom(value => validator.isInt(value, {min : 1700, max : new Date().getFullYear()}))
    // .withMessage('Out of range (1700 - current)'),

    body('price')
    .custom(value => validator.isInt(value, {gt: 0, max: 1000000000000}))
    .withMessage('Out of range (1 - 1 000 000 000 000)'),
]

const deleteValidations=[
    body('_id')
    .exists()
    .withMessage('Empty')
]

export default{
    search,
    create,
    update,
    deleteValidations
}
