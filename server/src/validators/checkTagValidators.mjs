import { createPosXChain, createPosYChain } from './tagValidators.mjs';
import db from '../db/client.mjs';
import { body } from 'express-validator';

const createPostCheckTagValidationChain = () => [
  body('photoId')
    .trim()
    .notEmpty()
    .withMessage('PhotoId is a required field')
    .custom(async (value) => {
      const existingPhoto = await db.image.findUnique({
        where: {
          id: value,
        },
      });
      if (!existingPhoto) throw new Error('That photo does not exist');
    }),
  createPosXChain(),
  createPosYChain(),
];

export { createPostCheckTagValidationChain };
