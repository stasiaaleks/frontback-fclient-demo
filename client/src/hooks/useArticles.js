import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ARTICLES_CHANGED, EVENTS_URL } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

// Loads data, then reloads it whenever the server announces a change over SSE.
// Reloads also when the user logs in or out, since what the server returns depends on it.
function useLiveData(load) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  // Responses can arrive out of order (several events in a row, or the id changed),
  // so only the latest request may update state
  const latestRequest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++latestRequest.current;
    try {
      const result = await load();
      if (request !== latestRequest.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (request !== latestRequest.current) return;
      setData(null);
      setError(err.message);
    }
  }, [load]);

  useEffect(() => {
    reload();
  }, [reload, user]);

  useEffect(() => {
    // EventSource reconnects by itself if the connection drops;
    // re-fetch on every (re)connect, since events sent while offline are lost
    const source = new EventSource(EVENTS_URL);
    source.onopen = reload;
    source.addEventListener(ARTICLES_CHANGED, reload);
    return () => {
      source.close();
      // Answers to requests from before cleanup (e.g. the previous id) are now stale
      latestRequest.current++;
    };
  }, [reload]);

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
