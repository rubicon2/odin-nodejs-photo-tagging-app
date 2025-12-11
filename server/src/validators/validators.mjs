import db from '../db/client.mjs';
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

export { createTagIdChain, createNameChain, createPosXChain, createPosYChain };
