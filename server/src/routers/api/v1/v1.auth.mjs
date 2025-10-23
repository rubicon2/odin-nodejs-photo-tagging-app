import * as controller from '../../../controllers/v1/auth.mjs';
import { Router } from 'express';

const auth = Router();

auth.post('/enable-admin', controller.postEnableAdminMode);
auth.post('/disable-admin', controller.postDisableAdminMode);

export default auth;
