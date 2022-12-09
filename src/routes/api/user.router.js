import {Router} from 'express';
import UserController from '../../app/controllers/api/user.controller.js';
import authMiddleware from '../../middlewares/auth-middleware.js';
import {roles} from '../../constants/credential.constant.js';
import multer from 'multer';
import { fileFilter } from '../../app/validations/image.validation.js';

const router = Router();
const upload=multer(fileFilter);

// router.put('/cart/addition',authMiddleware([roles.CUSTOMER]),UserController.addToCart);
// router.put('/cart',authMiddleware(roles.CUSTOMER),UserController.updateCart);
// router.get('/cart',authMiddleware(roles.CUSTOMER),UserController.getCart);
router.get('/username',UserController.findByUsername);
router.get('/id',UserController.getById);
router.post('/',[authMiddleware(),upload.single('image')],UserController.update);

export default router;