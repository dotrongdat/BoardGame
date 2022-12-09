import {Router} from 'express';
import CategoryController from '../../app/controllers/api/category.controller.js';
import multer from 'multer';
import {fileFilter} from '../../app/validations/image.validation.js';
import authMiddleware from '../../middlewares/auth-middleware.js';
import {roles} from '../../constants/credential.constant.js';
const router=Router();
const upload=multer(fileFilter);

router.post('/',authMiddleware(roles.ADMIN),CategoryController.create);
router.get('/',CategoryController.getAll);
router.put('/status/enable',authMiddleware(roles.ADMIN),CategoryController.enable);
router.put('/status/disable',authMiddleware(roles.ADMIN),CategoryController.disable);
router.put('/',authMiddleware(roles.ADMIN),CategoryController.update);

export default router;