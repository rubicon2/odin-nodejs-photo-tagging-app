import { body } from 'express-validator';

const createPosXChain = (field = 'posX') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is a required field`)
    .isFloat()
    .withMessage(`${field} should be a number`)
    .toFloat();

const createPosYChain = (field = 'posY') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is a required field`)
    .isFloat()
    .withMessage(`${field} should be a number`)
    .toFloat();

const createNameChain = (field = 'name') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is a required field`)
    .isAlphanumeric()
    .withMessage(`${field} should contain alphanumeric characters only`);

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

export {
  createPosXChain,
  createPosYChain,
  createNameChain,
  createPostTagValidationChain,
  createPutTagValidationChain,
};
