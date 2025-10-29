import { createPosXChain, createPosYChain } from './tagValidators.mjs';
import { body } from 'express-validator';

const createPostCheckTagValidationChain = () => [
  body('photoId').trim().notEmpty().withMessage('PhotoId is a required field'),
  createPosXChain(),
  createPosYChain(),
];

export { createPostCheckTagValidationChain };
