import { Link, useParams } from 'react-router';
import { useArticle } from '../hooks/useArticles.js';
import { StatusBadge, TagBadges } from '../components/Badges.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate } from '../formatters/format.js';

export default function ArticlePage() {
  const { id } = useParams();
  const { article, error } = useArticle(id);

  return (
    <>
      <Link to="/" className="btn btn-link px-0 mb-3">&larr; All articles</Link>
      {error && <ErrorAlert message={error} />}
      {!error && !article && <Spinner />}
      {article && (
        <article className="card">
          <div className="card-body">
            <h1 className="card-title h3">
              {article.title} {article.status !== 'published' && <StatusBadge status={article.status} />}
            </h1>
            <p className="text-body-secondary">
              {article.author}
              {article.publishedAt && <> &middot; {formatDate(article.publishedAt)}</>}
            </p>
            {/* plain text, not HTML - no XSS */}
            <p className="card-text" style={{ whiteSpace: 'pre-wrap' }}>{article.content}</p>
            <TagBadges tags={article.tags} />
          </div>
        </article>
      )}
    </>
  );
}
