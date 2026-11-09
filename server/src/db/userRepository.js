import Repository from './repository.js';
import CONFIG from '../constants/config.js';

class UserRepository extends Repository {
  constructor() {
    super(CONFIG.COLLECTIONS.USERS);
  }

  async findByUsername(username) {
    return await this.getCollection().findOne({ username });
  }

  async ensureIndexes() {
    await this.getCollection().createIndex({ username: 1 }, { unique: true });
  }
}

export default UserRepository;
