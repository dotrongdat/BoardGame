import {Router} from 'express';
import orderController from '../../app/controllers/api/order.controller.js';
import authMiddleware from '../../middlewares/auth-middleware.js';
import {roles} from '../../constants/credential.constant.js';

const router = Router();
router.post('/',orderController.checkout);
router.post('/validation',orderController.validateConfirmCart);
router.get('/',authMiddleware([roles.CUSTOMER,roles.ADMIN]),orderController.get);
router.get('/status',authMiddleware([roles.ADMIN]),orderController.getByStatus);
// router.put('/approve',authMiddleware([roles.ADMIN]),orderController.approve);
router.get('/vnpay',orderController.checkoutVNPay);
router.put('/status',authMiddleware([roles.ADMIN]),orderController.updateStatus);
router.put('/cancel',authMiddleware([roles.CUSTOMER]),orderController.cancelOrder);

export default router;