import * as controller from '../../controllers/api.mjs';
import isDevMode from '../../middleware/isDevMode.mjs';
import upload from '../../middleware/multer.mjs';
import { Router } from 'express';

const v1 = Router();

v1.get('/', controller.get);
v1.get('/photo', controller.getPhoto);
v1.post('/photo', isDevMode, upload.single('image'), controller.postPhoto);

export default v1;
