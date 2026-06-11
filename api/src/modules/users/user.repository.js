import User from './user.model.js';

class UserRepository {
  create(payload) {
    return User.create(payload);
  }

  findByEmail(email, options = {}) {
    const query = User.findOne({
      email: String(email).toLowerCase(),
      isDeleted: false,
    });

    if (options.withPassword) query.select('+password');
    return query;
  }

  findById(id) {
    return User.findOne({ _id: id, isDeleted: false }).select('-password');
  }

  findAll() {
    return User.find({ isDeleted: false }).select('-password').sort({ createdAt: -1 });
  }
}

const userRepository = new UserRepository();

export { UserRepository };
export default userRepository;
