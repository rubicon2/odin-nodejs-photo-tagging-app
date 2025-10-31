import * as controller from '../../../controllers/v1/auth.mjs';
import { createPostEnableAdminValidationChain } from '../../../validators/authValidators.mjs';
import { Router } from 'express';

const auth = Router();

auth.post(
  '/enable-admin',
  createPostEnableAdminValidationChain(),
  controller.postEnableAdminMode,
);
auth.post('/disable-admin', controller.postDisableAdminMode);

export default auth;
