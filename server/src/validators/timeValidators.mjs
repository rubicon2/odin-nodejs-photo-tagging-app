import { createNameChain } from './validators.mjs';

const createPostTimeValidationChain = () => [
  createNameChain()
    .isLength({ min: 3, max: 3 })
    .withMessage('name should be 3 characters long'),
];

export { createPostTimeValidationChain };
