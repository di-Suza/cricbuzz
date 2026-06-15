import { body, param, query } from 'express-validator';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdParam = (field = 'id') =>
  param(field)
    .trim()
    .matches(objectIdRegex)
    .withMessage('Invalid MongoDB ObjectId');

const idParamRules = [objectIdParam('id')];

export {
  body,
  param,
  query,
  objectIdRegex,
  objectIdParam,
  idParamRules,
};
