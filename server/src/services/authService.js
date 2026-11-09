import bcrypt from 'bcryptjs';
import UserRepository from '../db/userRepository.js';
import CONFIG from '../constants/config.js';
import HttpError from '../errors/httpError.js';

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

// Compared against when the username doesn't exist, so a wrong username
// takes as long as a wrong password and doesn't reveal which users exist
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

class AuthService {
  constructor() {
    this.repository = new UserRepository();
  }

  // Returns only what goes into the session, never the password hash
  async login(username, password) {
    if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
      throw HttpError.badRequest(CONFIG.ERRORS.CREDENTIALS_REQUIRED);
    }

    const user = await this.repository.findByUsername(username.trim());
    const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !matches) {
      throw HttpError.unauthorized(CONFIG.ERRORS.INVALID_CREDENTIALS);
    }

    return { id: String(user._id), username: user.username };
  }
}

export default AuthService;
