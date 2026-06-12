import asyncHandler from '../../shared/utils/asyncHandler.js';
import AuthCookie from '../../shared/utils/authCookie.js';
import authService from './auth.service.js';

class AuthController {
  constructor(service = authService) {
    this.service = service;
    this.register = asyncHandler(this.register.bind(this));
    this.login = asyncHandler(this.login.bind(this));
    this.refresh = asyncHandler(this.refresh.bind(this));
  }

  async register(req, res) {
    const data = await this.service.register(req.validated, req.user);
    res.status(201).json({ success: true, data });
  }

  async login(req, res) {
    const data = await this.service.login(req.body);
    res.json({ success: true, data });
  }

  async refresh(req, res) {
    const refreshToken = AuthCookie.getRefreshToken(req);
    const data = await this.service.refresh(refreshToken);
    res.json({ success: true, data });
  }
}

const authController = new AuthController();

export { AuthController };
export default authController;
