import db from '../db/client.mjs';
import { getImageIdFromRouteSanitizer } from './sanitizers.mjs';
import { body } from 'express-validator';

// This is for use when the tag id is part of the req.body, not part of the route params.
const createTagIdChain = (field = 'id') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${field} is a required field`)
    .isString()
    .withMessage(`${field} should be a string`)
    .custom(async (value) => {
      const tag = await db.imageTag.findUnique({
        where: {
          id: value,
        },
      });
      if (!tag) throw new Error(`Tag with id: ${value} does not exist`);
    });

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
  createPosXChain,
  createPosYChain,
  createNameChain,
  createPostTagValidationChain,
  createPutTagValidationChain,
  createCreateTagsArrayValidationChain,
  createUpdateTagsArrayValidationChain,
  createDeleteTagsArrayValidationChain,
  createPutTagsRouteValidationChain,
};
