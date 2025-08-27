import * as controller from '../../controllers/api.mjs';
import isDevMode from '../../middleware/isDevMode.mjs';
import upload from '../../middleware/multer.mjs';
import { Router } from 'express';

const v1 = Router();

v1.get('/', controller.get);
v1.get('/photo', controller.getPhotoIndex);
// v1.delete('/photo', isDevMode, upload.none(), controller.deletePhoto);
v1.post('/photo', isDevMode, upload.single('image'), controller.postPhoto);
v1.delete('/photo', isDevMode, controller.deleteAllPhotos);

export default v1;
