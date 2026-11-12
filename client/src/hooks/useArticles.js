import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Loads data, then reloads it whenever the server announces a change over SSE.
// Reloads also when the user logs in or out, since what the server returns depends on it.
function useLiveData(load) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Responses can arrive out of order, so only the latest request of this effect may update state;
    // cleanup bumps the counter so answers from before it (e.g. the previous id) are ignored too
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
    // EventSource reconnects by itself
    // re-fetch on every reconnect, events sent while offline are lost
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
