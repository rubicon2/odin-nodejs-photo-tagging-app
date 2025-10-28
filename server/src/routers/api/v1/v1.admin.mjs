import * as controller from '../../../controllers/v1/api.admin.mjs';
import { createPostTagValidationChain } from '../../../validators/tagValidators.mjs';
import upload from '../../../middleware/multer.mjs';
import { Router } from 'express';

const app = Router();

app.get('/photo', controller.getAllPhotosAndTags);
app.get('/photo/:id', controller.getPhotoAndTags);
app.post('/photo', upload.single('photo'), controller.postPhoto);
app.put('/photo/:id', upload.none(), controller.putPhoto);
app.delete('/photo', controller.deleteAllPhotos);
app.delete('/photo/:id', controller.deletePhoto);

app.get('/photo/:photoId/tag', controller.getAllPhotoTags);
app.get('/photo/:photoId/tag/:tagId', controller.getPhotoTag);
app.post(
  '/photo/:photoId/tag',
  createPostTagValidationChain(),
  controller.postPhotoTag,
);

export default app;
