import Repository from './repository.js';
import CONFIG from '../constants/config.js';

class ArticleRepository extends Repository {
  constructor() {
    super(CONFIG.COLLECTIONS.ARTICLES);
  }

  // Lock is held and has not expired yet
  heldBy(user) {
    return { 'lock.owner': user, 'lock.expiresAt': { $gt: new Date() } };
  }

  async findAllSorted(filter = {}) {
    return await this.findAll(filter, { createdAt: -1 });
  }

  // Succeeds if the article is unlocked, the lock expired, or user already holds it (renewal).
  // Checking and locking happen in one database call, so two users can't both get the lock.
  async acquireLock(id, user, ttlMs) {
    const now = new Date();
    const canLock = {
      $or: [
        { lock: null },
        { 'lock.expiresAt': { $lte: now } },
        { 'lock.owner': user }
      ]
    };

    const lock = {
      owner: user,
      acquiredAt: now,
      expiresAt: new Date(now.getTime() + ttlMs)
    };

    return await this.updateWhere(id, canLock, { $set: { lock } });
  }

  async releaseLock(id, user) {
    return await this.updateWhere(id, { 'lock.owner': user }, { $set: { lock: null } });
  }

  // A successful save also releases the lock
  async updateLocked(id, user, requiredStatus, fields) {
    return await this.updateWhere(
      id,
      { ...this.heldBy(user), status: requiredStatus },
      { $set: { ...fields, lock: null } }
    );
  }

  async deleteLocked(id, user) {
    return await this.deleteWhere(id, this.heldBy(user));
  }
}

export default ArticleRepository;
