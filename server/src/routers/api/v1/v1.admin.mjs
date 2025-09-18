import * as controller from '../../../controllers/api.admin.mjs';
import upload from '../../../middleware/multer.mjs';
import { Router } from 'express';

const app = Router();

app.get('/photo', controller.getAllPhotosAndTags);
app.get('/photo/:id', controller.getPhotoAndTags);
app.post('/photo', upload.single('photo'), controller.postPhoto);
app.put('/photo/:id', controller.putPhoto);
app.delete('/photo', controller.deleteAllPhotos);
app.delete('/photo/:id', controller.deletePhoto);

export default app;
