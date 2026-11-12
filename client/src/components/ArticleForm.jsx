import { useState } from 'react';

const toForm = (article) => ({
  title: article.title ?? '',
  author: article.author ?? '',
  content: article.content ?? '',
  tags: article.tags?.join(', ') ?? ''
});

// "a, b ,, c" -> ["a", "b", "c"]
const parseTags = (text) => text.split(',').map((tag) => tag.trim()).filter(Boolean);

export default function ArticleForm({ initial, submitLabel, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => toForm(initial));
  const [saving, setSaving] = useState(false);

  const change = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ ...form, tags: parseTags(form.tags) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row g-2 mb-2">
        <div className="col-md-6">
          <input className="form-control" placeholder="Title" value={form.title} onChange={change('title')} required />
        </div>
        <div className="col-md-6">
          <input className="form-control" placeholder="Author" value={form.author} onChange={change('author')} required />
        </div>
      </div>
      <textarea className="form-control mb-2" rows="4" placeholder="Content" value={form.content} onChange={change('content')} required />
      <input className="form-control mb-3" placeholder="Tags, comma separated" value={form.tags} onChange={change('tags')} />
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving}>{submitLabel}</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </form>
  );
}
