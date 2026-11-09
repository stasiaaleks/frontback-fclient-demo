import { Link } from 'react-router';
import { useArticles } from '../hooks/useArticles.js';
import { TagBadges } from '../components/Badges.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import Spinner from '../components/Spinner.jsx';
import { formatDate } from '../formatters/format.js';

export default function ReaderPage() {
  const { articles, error } = useArticles();

  if (error) return <ErrorAlert message={error} />;
  if (!articles) return <Spinner />;

  // Logged-in users get every status from the API; the reader view shows only published ones
  const published = articles.filter((article) => article.status === 'published');

  return (
    <>
      <h1 className="h3 mb-4">Latest articles</h1>
      {published.length === 0 && <p className="text-secondary">Nothing published yet.</p>}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {published.map((article) => (
          <div className="col" key={article._id}>
            <div className="card h-100">
              <div className="card-body">
                <h2 className="card-title h5">
                  <Link to={`/articles/${article._id}`} className="stretched-link text-decoration-none">{article.title}</Link>
                </h2>
                <h3 className="card-subtitle h6 mb-2 text-body-secondary">{article.author}</h3>
                <p className="card-text">{article.content}</p>
              </div>
              <div className="card-footer d-flex justify-content-between align-items-center">
                <div><TagBadges tags={article.tags} /></div>
                <small className="text-body-secondary">{formatDate(article.publishedAt)}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
