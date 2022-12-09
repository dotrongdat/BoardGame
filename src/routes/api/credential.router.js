import {Router} from 'express';
import CredentialController from '../../app/controllers/api/credential.controller.js';
import authMiddleware from '../../middlewares/auth-middleware.js';
//import multer from 'multer';

const router = Router();

router.post('/signin',CredentialController.signIn);
router.post('/signout',CredentialController.signOut);
router.post('/signup',CredentialController.signUp);
router.post('/signinToken',authMiddleware(),CredentialController.signInToken);
router.post('/refreshToken',CredentialController.refreshToken);
router.get('/refreshVerifyCode',CredentialController.refreshVerifyCode);
router.post('/verifyCode',CredentialController.verifyCode);
router.post('/forgotPassword',CredentialController.forgotPassword);
router.post('/verifyForgotPasswordCode',CredentialController.verifyForgotPasswordCode);
router.get('/refreshVerifyForgotPasswordCode',CredentialController.refreshVerifyForgotPasswordCode);
router.post('/resetPassword',authMiddleware(),CredentialController.resetPassword);

export default router;