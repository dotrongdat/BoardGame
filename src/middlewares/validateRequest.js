import validator from 'validator';
import {sortFields} from '../constants/product.constant.js';
import path from 'path';
import {validExtensionFile} from '../constants/image.constant.js';
import {validationResult} from 'express-validator';

const validateRequest=(validations)=>{
    return async (req,res,next)=>{
        await Promise.all(validations.map(validation=>validation.run(req)));
        const errors=validationResult(req);
        if(errors.isEmpty()) next();
        else res.status(400).json({
            errors
        });
    }
}
export default validateRequest;

// export function postRequest(req, res, next) {
//     try {
//         let check = true;
//         //const data=multer({storage:multer.diskStorage({destination:'',filename:''})}).single('profile_pic');
//         // data(req,res,(err)=>{            
//         //    }       
//         //)
//         if(req.file){
//             const ext=path.extname(req.file.originalname);
//             check= validExtensionFile.includes(ext); 
//         }else check=false;
//         if (validator.isEmpty(req.body.name, {
//                 ignore_whitespace: true
//             })) check = false;
//         else if (!validator.isInt(req.body.quantity, {
//                 gte: 0
//             })) check = false;
//         else if (!validator.isInt(req.body.publishedYear)) check = false;
//         else if (!validator.isInt(req.body.price, {
//                 gt: 0
//             })) check = false;
//        if (check == true) next();
//        else
//         res.status(400).json({
//             message: "Bad Request"
//         })
//     } catch (error) {
//         res.status(400).json({
//             message: "Bad Request"
//         })
//     }

// }

// export function putRequest(req, res, next) {
//     try {
//         let check = true;
//         if(req.file){
//             const ext=path.extname(req.file.originalname);
//             check = validExtensionFile.includes(ext); 
//         }
//         if (validator.isEmpty(req.body._id)) check = false;
//         else if (validator.isEmpty(req.body.name, {
//                 ignore_whitespace: true
//             })) check = false;
//         else if (!validator.isInt(req.body.publishedYear)) check = false;
//         else if (!validator.isInt(req.body.quantity, {
//                 gt: 0
//             })) check = false;
//         else if (!validator.isInt(req.body.price, {
//                 gt: 0
//             })) check = false;
//         if (check == true) next();
//         else res.status(400).json({
//             message: "Bad Request"
//         })
//     } catch (error) {
//         res.status(400).json({
//             message: "Bad Request"
//         })
//     }

// }

// export function deleteRequest(req, res, next) {
//     try {
//         if (validator.isEmpty(req.body._id)) res.status(400).json({
//             message: "Bad Request"
//         })
//         next();
//     } catch (error) {
//         res.status(400).json({
//             message: "Bad Request"
//         })
//     }

// }
// export function searchRequest(req, res, next) {
//     const inc = req.query.inc
//     const sortBy =req.query.sortBy
//     let check = true;
//     if (inc) {
//         if (!(inc === 'true' || inc === 'false')) check = false;
//     }
//     if (sortBy){
//         if(!sortFields.includes(sortBy)) check = false;
//     }
//     if (check == true) next();
//     else res.status(400).json({
//         message: "Bad Request"
//     });
// }