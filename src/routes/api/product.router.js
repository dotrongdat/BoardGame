import express from 'express';
import productController from '../../app/controllers/api/product.controller.js';
//import {searchRequest,putRequest,postRequest,deleteRequest} from '../../middlewares/validateRequest.js';
import productValidation from '../../app/validations/product.validation.js';
import multer from 'multer';
import {fileFilter} from '../../app/validations/image.validation.js';
import validateRequestMiddleWare from '../../middlewares/validateRequest.js';
import authMiddleware from '../../middlewares/auth-middleware.js';
import {roles} from '../../constants/credential.constant.js';
// import {validExtensionFile} from '../../constants/image.constant.js';
// import path from 'path';

const router=express.Router();
const upload=multer(fileFilter);

router.get('/search',validateRequestMiddleWare(productValidation.search),productController.search);
router.post('/',[authMiddleware(roles.ADMIN),upload.array('albumFile',10),validateRequestMiddleWare(productValidation.create)],productController.create);
router.put('/',[authMiddleware(roles.ADMIN),upload.array('albumFile',10),validateRequestMiddleWare(productValidation.update)],productController.update);
// router.get('/admin',authMiddleware(roles.ADMIN),productController.getAllByAdmin);
router.get('/:_id',productController.get);
router.get('/',productController.getAll);
router.delete('/',[authMiddleware(roles.ADMIN),validateRequestMiddleWare(productValidation.deleteValidations)],productController.deleteProduct);


//router.post('/createOP',upload.fields([{name:'imageFile',maxCount:1},{name:'albumFile',maxCount:10}]),productController.createOP);

export default router;