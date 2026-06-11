import asyncHandler from '../../shared/utils/asyncHandler.js';
import userService from './user.service.js';

class UserController {
  constructor(service = userService) {
    this.service = service;
    this.getUsers = asyncHandler(this.getUsers.bind(this));
    this.getUserById = asyncHandler(this.getUserById.bind(this));
  }

  async getUsers(_req, res) {
    const users = await this.service.getUsers();
    res.json({ success: true, data: users });
  }

  async getUserById(req, res) {
    const user = await this.service.getUserById(req.params.id);
    res.json({ success: true, data: user });
  }
}

const userController = new UserController();

export { UserController };
export default userController;
