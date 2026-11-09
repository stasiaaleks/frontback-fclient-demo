import ArticleService from '../services/articleService.js';
import CONFIG from '../constants/config.js';

// The acting user comes from the session (set at login), never from the request body,
// so a client can't act on someone else's lock. requireAuth guarantees it on mutations.
const currentUser = (req) => req.session.user.username;

class ArticleController {
  // Handlers are arrow functions, not regular methods
  // The router calls them (e.g. router.get('/', controller.getAll)),
  // and a regular method called that way loses `this`, so `this.service` would be undefined
  // Arrow functions always keep `this` pointing to the controller
  service = new ArticleService();

  getAll = async (req, res) => {
    res.json(await this.service.getAllArticles(req.session.user));
  };

  getById = async (req, res) => {
    res.json(await this.service.getArticleById(req.params.id, req.session.user));
  };

  create = async (req, res) => {
    const article = await this.service.addArticle(req.body);
    res.status(CONFIG.HTTP_STATUS.CREATED).json(article);
  };

  update = async (req, res) => {
    res.json(await this.service.updateArticle(req.params.id, currentUser(req), req.body));
  };

  delete = async (req, res) => {
    await this.service.deleteArticle(req.params.id, currentUser(req));
    res.status(CONFIG.HTTP_STATUS.NO_CONTENT).end();
  };

  lock = async (req, res) => {
    res.json(await this.service.lockArticle(req.params.id, currentUser(req)));
  };

  unlock = async (req, res) => {
    res.json(await this.service.unlockArticle(req.params.id, currentUser(req)));
  };

  publish = async (req, res) => {
    res.json(await this.service.publishArticle(req.params.id, currentUser(req)));
  };

  unpublish = async (req, res) => {
    res.json(await this.service.unpublishArticle(req.params.id, currentUser(req)));
  };

  archive = async (req, res) => {
    res.json(await this.service.archiveArticle(req.params.id, currentUser(req)));
  };
}

export default ArticleController;
