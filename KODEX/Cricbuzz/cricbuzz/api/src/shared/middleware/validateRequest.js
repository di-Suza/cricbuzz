import { matchedData, validationResult } from 'express-validator';

import { BadRequestError } from '../errors/index.js';

class RequestValidator {
  static validate(rules = []) {
    const validationRules = Array.isArray(rules) ? rules : [rules];

    return [
      ...validationRules,
      function validateRequest(req, _res, next) {
        const result = validationResult(req);

        if (!result.isEmpty()) {
          const details = result.array({ onlyFirstError: true }).map((error) => ({
            path: error.path,
            location: error.location,
            message: error.msg,
            value: error.value,
          }));

          return next(new BadRequestError('Validation failed', details));
        }

        req.validated = matchedData(req, {
          includeOptionals: true,
          locations: ['body', 'params', 'query'],
        });

        return next();
      },
    ];
  }
}

const validateRequest = RequestValidator.validate;

export { RequestValidator };
export default validateRequest;
