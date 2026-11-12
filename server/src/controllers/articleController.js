import ArticleService from '../services/articleService.js';
import CONFIG from '../constants/config.js';

// the user always comes from the session, never from the body
const currentUser = (req) => req.session.user.username;

class ArticleController {
  // arrow functions so `this` still works when the router calls them
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
