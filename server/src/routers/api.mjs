import * as controller from '../controllers/api.mjs';
import { Router } from 'express';

const api = Router();

api.get('/', controller.get);

export default api;
