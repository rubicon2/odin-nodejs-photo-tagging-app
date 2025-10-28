import { body } from 'express-validator';

const createPostTagValidationChain = () => [
  body('posX')
    .trim()
    .notEmpty()
    .withMessage('Position X is a required field')
    .isFloat()
    .withMessage('Position X should be a number')
    .toFloat(),
  body('posY')
    .trim()
    .notEmpty()
    .withMessage('Position Y is a required field')
    .isFloat()
    .withMessage('Position Y should be a number')
    .toFloat(),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is a required field')
    .isAlphanumeric()
    .withMessage('Name should contain alphanumeric characters only'),
];

export { createPostTagValidationChain };
