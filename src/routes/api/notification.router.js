import {Router} from 'express';
import notificationController from '../../app/controllers/api/notification.controller.js';
import authMiddleware from '../../middlewares/auth-middleware.js';
import {roles} from '../../constants/credential.constant.js';

const router = Router();
router.get('/',authMiddleware([roles.ADMIN,roles.CUSTOMER]),notificationController.get);
router.put('/',authMiddleware([roles.ADMIN,roles.CUSTOMER]),notificationController.markRead);

export default router;