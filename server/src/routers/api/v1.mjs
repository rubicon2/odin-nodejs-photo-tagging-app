import * as controller from '../../controllers/api.mjs';
import isDevMode from '../../middleware/isDevMode.mjs';
import upload from '../../middleware/multer.mjs';
import { Router } from 'express';

const v1 = Router();

v1.get('/', controller.get);
v1.get('/photo', controller.getAllPhotos);
v1.post('/photo', isDevMode, upload.single('photo'), controller.postPhoto);
v1.delete('/photo', isDevMode, controller.deleteAllPhotos);

v1.get('/photo/:id', controller.getPhoto);
v1.put('/photo/:id', controller.putPhoto);
v1.delete('/photo/:id', isDevMode, controller.deletePhoto);

export default v1;
