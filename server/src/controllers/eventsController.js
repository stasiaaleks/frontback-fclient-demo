import CONFIG from '../constants/config.js';
import articleEvents from '../events/articleEvents.js';

const { EVENT, HEARTBEAT_MS } = CONFIG.SSE;

// Server-Sent Events: one long-lived response per tab, the server writes to it on every change.
// The event carries no data; clients re-fetch JSON, so access rules stay in one place.
class EventsController {
  stream = (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.flushHeaders();
    res.write('retry: 3000\n\n');

    const onChange = () => res.write(`event: ${EVENT}\ndata: {}\n\n`);
    // Comment lines keep proxies from closing an idle connection
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

    articleEvents.on(EVENT, onChange);
    req.on('close', () => {
      clearInterval(heartbeat);
      articleEvents.off(EVENT, onChange);
    });
  };
}

export default EventsController;
