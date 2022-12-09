import express from 'express';
import imageRouter from './image.router.js';
const router=express.Router();

router.use('/image',imageRouter);

export default router;