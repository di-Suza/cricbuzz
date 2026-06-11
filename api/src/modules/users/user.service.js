import { NotFoundError } from '../../shared/errors/index.js';
import userRepository from './user.repository.js';

class UserService {
  constructor(repository = userRepository) {
    this.repository = repository;
  }

  getUsers() {
    return this.repository.findAll();
  }

  async getUserById(id) {
    const user = await this.repository.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

const userService = new UserService();

export { UserService };
export default userService;
