import { body } from 'express-validator';

const createPostEnableAdminValidationChain = () => [
  body('password').notEmpty().withMessage('Password is a required field'),
];

export { createPostEnableAdminValidationChain };
