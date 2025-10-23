import * as controller from '../../../controllers/api.mjs';
import authRouter from './v1.auth.mjs';
import adminRouter from './v1.admin.mjs';
import isAdmin from '../../../middleware/isAdmin.mjs';
import { Router } from 'express';

const v1 = Router();

// Some routes only available as admin. User can enable admin mode by providing a password.
// Do not send list of tags to non-admin client, otherwise it would be easy for client user to cheat.
v1.use('/admin', isAdmin, adminRouter);

// For enabling/disabling admin mode.
v1.use('/auth', authRouter);

// Standard non-admin routes.
v1.get('/photo', controller.getAllPhotos);
v1.get('/photo/:id', controller.getPhoto);
// And a method for posting a click location to check if tag has been found.
// v1.post('/photo/:id/, controller.handlePhotoClick)

export default v1;
