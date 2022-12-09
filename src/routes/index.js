import apiRouter from './api/index.js';
import resourceRouter from './resources/index.js';
import test from '../app/controllers/test.js';
import multer from 'multer';
import { fileFilter } from '../app/validations/image.validation.js';

const upload = multer(fileFilter);
export default function route(app){
    app.use('/api',apiRouter);
    app.use('/src',resourceRouter);
    //app.post('/test',upload.single('image'),test);
    app.post('/test',test);
};