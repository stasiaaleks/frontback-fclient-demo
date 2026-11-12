import ArticleRepository from '../db/articleRepository.js';
import CONFIG from '../constants/config.js';
import HttpError from '../errors/httpError.js';
import articleEvents from '../events/articleEvents.js';

const { DRAFT, PUBLISHED, ARCHIVED } = CONFIG.STATUS;

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

// hide locks from anonymous readers
const toPublic = ({ lock, ...article }) => article;

class ArticleService {
  constructor() {
    this.repository = new ArticleRepository();
  }

  validateFields({ title, author, content, tags = [] }) {
    if (![title, author, content].every(isNonEmptyString)) {
      throw HttpError.badRequest(CONFIG.ERRORS.REQUIRED_FIELDS);
    }

    if (!Array.isArray(tags) || !tags.every(isNonEmptyString)) {
      throw HttpError.badRequest(CONFIG.ERRORS.INVALID_TAGS);
    }

    return { title: title.trim(), author: author.trim(), content, tags: tags.map((tag) => tag.trim()) };
  }

  // notify browsers, no payload since the stream is public
  notify() {
    articleEvents.emit(CONFIG.SSE.EVENT);
  }

  // single conditional update, if nothing matched figure out why
  async explainFailure(id, user, requiredStatus, statusMessage) {
    const article = await this.findOrThrow(id);
    const { lock } = article;
    const isActive = lock?.expiresAt > new Date();

    if (isActive && lock.owner !== user) {
      const until = lock.expiresAt.toISOString().slice(0, 19).replace('T', ' ');
      throw HttpError.locked(CONFIG.ERRORS.LOCKED_BY(lock.owner, until));
    }

    if (!isActive) {
      throw HttpError.locked(CONFIG.ERRORS.LOCK_REQUIRED);
    }

    if (requiredStatus && article.status !== requiredStatus) {
      throw HttpError.conflict(statusMessage);
    }

    throw HttpError.conflict(CONFIG.ERRORS.CONCURRENT_MODIFICATION);
  }

  async findOrThrow(id) {
    const article = await this.repository.findById(id);
    if (!article) {
      throw HttpError.notFound(CONFIG.ERRORS.ARTICLE_NOT_FOUND);
    }
    return article;
  }

  // no viewer -> only published articles
  async getAllArticles(viewer) {
    if (viewer) {
      return await this.repository.findAllSorted();
    }
    const articles = await this.repository.findAllSorted({ status: PUBLISHED });
    return articles.map(toPublic);
  }

  async getArticleById(id, viewer) {
    const article = await this.findOrThrow(id);
    if (viewer) {
      return article;
    }
    // 404 not 403, don't reveal drafts
    if (article.status !== PUBLISHED) {
      throw HttpError.notFound(CONFIG.ERRORS.ARTICLE_NOT_FOUND);
    }
    return toPublic(article);
  }

  async addArticle(data) {
    const fields = this.validateFields(data);
    const article = await this.repository.create({ ...fields, status: DRAFT, publishedAt: null, lock: null });
    this.notify();
    return article;
  }

  async updateArticle(id, user, data) {
    const fields = this.validateFields(data);
    const updated = await this.repository.updateLocked(id, user, DRAFT, fields);
    if (!updated) {
      await this.explainFailure(id, user, DRAFT, CONFIG.ERRORS.NOT_EDITABLE);
    }
    this.notify();
    return updated;
  }

  async deleteArticle(id, user) {
    const deleted = await this.repository.deleteLocked(id, user);
    if (!deleted) {
      await this.explainFailure(id, user);
    }
    this.notify();
  }

  async lockArticle(id, user) {
    const locked = await this.repository.acquireLock(id, user, CONFIG.LOCK_TTL_MS);
    if (!locked) {
      await this.explainFailure(id, user);
    }
    this.notify();
    return locked;
  }

  async unlockArticle(id, user) {
    const unlocked = await this.repository.releaseLock(id, user);
    if (!unlocked) {
      await this.explainFailure(id, user);
    }
    this.notify();
    return unlocked;
  }

  async changeStatus(id, user, action, from, to, extraFields = {}) {
    const updated = await this.repository.updateLocked(id, user, from, { status: to, ...extraFields });
    if (!updated) {
      await this.explainFailure(id, user, from, CONFIG.ERRORS.INVALID_TRANSITION(action, from));
    }
    this.notify();
    return updated;
  }

  async publishArticle(id, user) {
    return await this.changeStatus(id, user, 'publish', DRAFT, PUBLISHED, { publishedAt: new Date() });
  }

  async unpublishArticle(id, user) {
    return await this.changeStatus(id, user, 'unpublish', PUBLISHED, DRAFT, { publishedAt: null });
  }

  async archiveArticle(id, user) {
    return await this.changeStatus(id, user, 'archive', PUBLISHED, ARCHIVED);
  }
}

export default ArticleService;
