import { useState } from 'react';
import { Link } from 'react-router';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useArticles } from '../hooks/useArticles.js';
import { LockBadge, StatusBadge } from '../components/Badges.jsx';
import ArticleForm from '../components/ArticleForm.jsx';
import ErrorAlert from '../components/ErrorAlert.jsx';
import Spinner from '../components/Spinner.jsx';

// The server only lets the lock holder change an article, and a successful change releases the lock.
// One-click actions therefore lock first; if the action fails, the lock is given back.
async function withLock(id, action) {
  await api.lock(id);
  try {
    await action(id);
  } catch (err) {
    await api.unlock(id).catch(() => {});
    throw err;
  }
}

const ACTIONS = {
  draft: [{ label: 'Publish', run: api.publish, style: 'success' }],
  published: [
    { label: 'Unpublish', run: api.unpublish, style: 'secondary' },
    { label: 'Archive', run: api.archive, style: 'dark' }
  ],
  archived: []
};

export default function AdminPage() {
  const { user } = useAuth();
  const { articles, error: loadError } = useArticles();
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Runs an API call and shows its error; the list itself refreshes through SSE
  const attempt = async (fn) => {
    try {
      setError(null);
      await fn();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const create = async (fields) => {
    if (await attempt(() => api.createArticle(fields))) setCreating(false);
  };

  // Editing holds the lock while the form is open, so nobody else can change the article meanwhile
  const startEdit = (id) => attempt(async () => {
    await api.lock(id);
    setEditingId(id);
  });

  const saveEdit = async (fields) => {
    // Renew the lock first (allowed for the owner), so a save after the lock TTL still works
    const saved = await attempt(async () => {
      await api.lock(editingId);
      await api.updateArticle(editingId, fields);
    });
    if (saved) setEditingId(null);
  };

  const cancelEdit = async () => {
    await attempt(() => api.unlock(editingId));
    setEditingId(null);
  };

  const remove = (article) => {
    if (window.confirm(`Delete "${article.title}"?`)) {
      attempt(() => withLock(article._id, api.deleteArticle));
    }
  };

  if (loadError) return <ErrorAlert message={loadError} />;
  if (!articles) return <Spinner />;

  const editing = articles.find((article) => article._id === editingId);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 mb-0">Admin</h1>
        {!creating && <button className="btn btn-primary" onClick={() => setCreating(true)}>New article</button>}
      </div>

      <ErrorAlert message={error} onClose={() => setError(null)} />

      {creating && (
        <div className="card card-body mb-4 shadow-sm">
          <h2 className="h5">New draft</h2>
          <ArticleForm initial={{ author: user.username }} submitLabel="Create" onSubmit={create} onCancel={() => setCreating(false)} />
        </div>
      )}

      {editing && (
        <div className="card card-body mb-4 shadow-sm border-primary">
          <h2 className="h5">Editing &ldquo;{editing.title}&rdquo;</h2>
          {/* key resets the form if another article is opened */}
          <ArticleForm key={editing._id} initial={editing} submitLabel="Save" onSubmit={saveEdit} onCancel={cancelEdit} />
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-hover align-middle bg-body">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article._id}>
                <td>
                  <Link to={`/articles/${article._id}`}>{article.title}</Link>{' '}
                  <LockBadge lock={article.lock} currentUser={user.username} />
                </td>
                <td>{article.author}</td>
                <td><StatusBadge status={article.status} /></td>
                <td className="text-end text-nowrap">
                  <div className="btn-group btn-group-sm">
                    {article.status === 'draft' && (
                      <button className="btn btn-outline-primary" disabled={Boolean(editing)} onClick={() => startEdit(article._id)}>Edit</button>
                    )}
                    {ACTIONS[article.status].map(({ label, run, style }) => (
                      <button key={label} className={`btn btn-outline-${style}`} disabled={article._id === editingId}
                        onClick={() => attempt(() => withLock(article._id, run))}>{label}</button>
                    ))}
                    <button className="btn btn-outline-danger" disabled={article._id === editingId} onClick={() => remove(article)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
