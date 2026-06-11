import asyncHandler from '../../shared/utils/asyncHandler.js';
import authService from './auth.service.js';

class AuthController {
  constructor(service = authService) {
    this.service = service;
    this.register = asyncHandler(this.register.bind(this));
    this.login = asyncHandler(this.login.bind(this));
  }

  async register(req, res) {
    const data = await this.service.register(req.body);
    res.status(201).json({ success: true, data });
  }

  async login(req, res) {
    const data = await this.service.login(req.body);
    res.json({ success: true, data });
  }
}

const authController = new AuthController();

export { AuthController };
export default authController;
