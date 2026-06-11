import express from 'express';

import validateRequest from '../../shared/middleware/validateRequest.js';
import authController from './auth.controller.js';
import { loginRules, registerRules } from './validators/auth.validator.js';

class AuthRoutes {
  constructor() {
    this.router = express.Router();
    this.register(); //it's just setup method there's nothing to do with registering a user
  }

  register() {
    this.router.post('/register', validateRequest(registerRules), authController.register);
    this.router.post('/login', validateRequest(loginRules), authController.login);
  }

  getRouter() {
    return this.router;
  }
}

export { AuthRoutes };
export default new AuthRoutes().getRouter();
