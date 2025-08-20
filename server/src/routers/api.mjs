import v1 from './api/v1.mjs';
import { Router } from 'express';

const api = Router();

api.use('/v1', v1);

export default api;
