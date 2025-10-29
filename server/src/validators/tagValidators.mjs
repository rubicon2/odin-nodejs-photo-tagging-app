import { body } from 'express-validator';

const createPosXChain = () =>
  body('posX')
    .trim()
    .notEmpty()
    .withMessage('Position X is a required field')
    .isFloat()
    .withMessage('Position X should be a number')
    .toFloat();

const createPosYChain = () =>
  body('posY')
    .trim()
    .notEmpty()
    .withMessage('Position Y is a required field')
    .isFloat()
    .withMessage('Position Y should be a number')
    .toFloat();

const createNameChain = () =>
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is a required field')
    .isAlphanumeric()
    .withMessage('Name should contain alphanumeric characters only');

const createPostTagValidationChain = () => [
  createPosXChain(),
  createPosYChain(),
  createNameChain(),
];

const createPutTagValidationChain = () => [
  createPosXChain().optional(),
  createPosYChain().optional(),
  createNameChain().optional(),
];

export { createPostTagValidationChain, createPutTagValidationChain };
