import { ObjectId } from 'mongodb';
import { getDB } from './connection.js';

// generic dao, the only place that talks to mongo
class Repository {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  getCollection() {
    return getDB().collection(this.collectionName);
  }

  // invalid id -> null (404), not a driver error
  toObjectId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  }

  async findAll(filter = {}, sort = {}) {
    return await this.getCollection().find(filter).sort(sort).toArray();
  }

  async findById(id) {
    const _id = this.toObjectId(id);
    if (!_id) return null;
    return await this.getCollection().findOne({ _id });
  }

  withTimestamps(data) {
    const now = new Date();
    return { ...data, createdAt: now, updatedAt: now };
  }

  async create(data) {
    const document = this.withTimestamps(data);
    const result = await this.getCollection().insertOne(document);
    return { _id: result.insertedId, ...document };
  }

  async createMany(items) {
    const documents = items.map((item) => this.withTimestamps(item));
    const result = await this.getCollection().insertMany(documents);
    return result.insertedCount;
  }

  async update(id, data) {
    return await this.updateWhere(id, {}, { $set: data });
  }

  async delete(id) {
    return await this.deleteWhere(id, {});
  }

  async deleteAll() {
    const result = await this.getCollection().deleteMany({});
    return result.deletedCount;
  }

  // atomic: only updates if the conditions match
  async updateWhere(id, conditions, update) {
    const _id = this.toObjectId(id);
    if (!_id) return null;
    return await this.getCollection().findOneAndUpdate(
      { _id, ...conditions },
      { ...update, $set: { ...update.$set, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
  }

  async deleteWhere(id, conditions) {
    const _id = this.toObjectId(id);
    if (!_id) return false;
    const result = await this.getCollection().deleteOne({ _id, ...conditions });
    return result.deletedCount > 0;
  }
}

export default Repository;
