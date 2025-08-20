import * as controller from '../../controllers/api.mjs';
import { Router } from 'express';

const v1 = Router();

v1.get('/', controller.get);

export default v1;
