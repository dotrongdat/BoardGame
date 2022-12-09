import {Router} from 'express';
import imageController from '../../app/controllers/resources/image.controller.js';
const router=Router();

router.get('/:path',imageController.get);
export default router;