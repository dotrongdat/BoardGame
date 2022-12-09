import {Router} from 'express';
import multer from 'multer';
import blogController from '../../app/controllers/api/blog.controller.js';
import { fileFilter } from '../../app/validations/image.validation.js';
import { roles } from '../../constants/credential.constant.js';
import authMiddleware from '../../middlewares/auth-middleware.js';

const router = Router();
const upload=multer(fileFilter);

router.get('/',blogController.getAll);
router.post('/',[authMiddleware([roles.ADMIN]),upload.single('image')],blogController.create);
router.put('/',[authMiddleware([roles.ADMIN]),upload.single('image')],blogController.update);
router.delete('/',authMiddleware([roles.ADMIN]),blogController.deleteBlog);

export default router;