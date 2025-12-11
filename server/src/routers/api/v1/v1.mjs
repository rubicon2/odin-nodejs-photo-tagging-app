import * as controller from '../../../controllers/v1/api.mjs';
import authRouter from './v1.auth.mjs';
import adminRouter from './v1.admin.mjs';
import isAdmin from '../../../middleware/isAdmin.mjs';
import { createPostCheckTagValidationChain } from '../../../validators/checkTagValidators.mjs';
import { Router } from 'express';

const v1 = Router();

// Some routes only available as admin. User can enable admin mode by providing a password.
// Do not send list of tags to non-admin client, otherwise it would be easy for client user to cheat.
v1.use('/admin', isAdmin, adminRouter);

// For enabling/disabling admin mode.
v1.use('/auth', authRouter);

// Standard non-admin routes.
v1.get('/photo', controller.getRandomPhoto);
v1.get('/time', controller.getPhotoTopTimes);

v1.post('/time', controller.postPhotoTopTime);
v1.post(
  '/check-tag',
  createPostCheckTagValidationChain(),
  controller.postCheckTag,
);

export default v1;
