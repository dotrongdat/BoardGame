import {Router} from 'express';
import messageController from '../../app/controllers/api/message.controller.js';
import authMiddleware from '../../middlewares/auth-middleware.js';
import {roles} from '../../constants/credential.constant.js';

const router = Router();

router.get('/',authMiddleware([roles.ADMIN,roles.CUSTOMER]),messageController.get);
router.put('/',authMiddleware([roles.ADMIN,roles.CUSTOMER]),messageController.send);
router.post('/',authMiddleware([roles.ADMIN,roles.CUSTOMER]),messageController.create);
router.get('/id',authMiddleware([roles.ADMIN,roles.CUSTOMER]),messageController.getById);
router.get('/user',authMiddleware([roles.ADMIN,roles.CUSTOMER]),messageController.getByUserId);
router.put('/checkedUser',authMiddleware([roles.ADMIN,roles.CUSTOMER]),messageController.markRead);
router.post('/sendToAdmin',authMiddleware([roles.CUSTOMER]),messageController.sendToAdmin);
export default router;