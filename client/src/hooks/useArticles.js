import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

// load once, then reload on SSE events and on login/logout
function useLiveData(load) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ignore stale responses (out of order, or from before cleanup)
    let latest = 0;
    const reload = async () => {
      const request = ++latest;
      try {
        const result = await load();
        if (request === latest) { setData(result); setError(null); }
      } catch (err) {
        if (request === latest) { setData(null); setError(err.message); }
      }
    };

    reload();
    // refetch on reconnect, we may have missed events
    const source = new EventSource('/api/events');
    source.onopen = reload;
    source.addEventListener('articles-changed', reload);
    return () => {
      source.close();
      latest++;
    };
  }, [load, user]);

  return { data, error };
}

export function useArticles() {
  const { data, error } = useLiveData(api.getArticles);
  return { articles: data, error };
}

export function useArticle(id) {
  const load = useCallback(() => api.getArticle(id), [id]);
  const { data, error } = useLiveData(load);
  return { article: data, error };
}
