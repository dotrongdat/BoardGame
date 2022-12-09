import express from 'express';
import productRouter from './product.router.js';
import categoryRouter from './category.router.js';
import credentialRouter from './credential.router.js';
import userRouter from './user.router.js';
import orderRouter from './order.router.js';
import notificationRouter from './notification.router.js';
import messageRouter from './message.router.js';
import blogRouter from './blog.router.js';
const router=express.Router();

router.use('/product',productRouter);
router.use('/category',categoryRouter);
router.use('/credential',credentialRouter);
router.use('/user',userRouter);
router.use('/order',orderRouter);
router.use('/notification',notificationRouter);
router.use('/message',messageRouter);
router.use('/blog',blogRouter);

export default router;