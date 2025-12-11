import {
  createTagIdChain,
  createNameChain,
  createPosXChain,
  createPosYChain,
} from './validators.mjs';
import { getImageIdFromRouteSanitizer } from './sanitizers.mjs';
import { body } from 'express-validator';

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

const createCreateTagsArrayValidationChain = () => [
  body('create.*.imageId').customSanitizer(getImageIdFromRouteSanitizer),
  createNameChain('create.*.name'),
  createPosXChain('create.*.posX'),
  createPosYChain('create.*.posY'),
];

const createUpdateTagsArrayValidationChain = () => [
  createTagIdChain('update.*.id'),
  createNameChain('update.*.name').optional(),
  createPosXChain('update.*.posX').optional(),
  createPosYChain('update.*.posY').optional(),
];

const createDeleteTagsArrayValidationChain = () => [
  createTagIdChain('delete.*'),
];

const createPutTagsRouteValidationChain = () => [
  body('create')
    .isArray()
    .withMessage('create field is not an array')
    .optional(),
  body('update')
    .isArray()
    .withMessage('update field is not an array')
    .optional(),
  body('delete')
    .isArray()
    .withMessage('delete field is not an array')
    .optional(),
  ...createCreateTagsArrayValidationChain(),
  ...createUpdateTagsArrayValidationChain(),
  ...createDeleteTagsArrayValidationChain(),
];

export {
  createPostTagValidationChain,
  createPutTagValidationChain,
  createCreateTagsArrayValidationChain,
  createUpdateTagsArrayValidationChain,
  createDeleteTagsArrayValidationChain,
  createPutTagsRouteValidationChain,
};
