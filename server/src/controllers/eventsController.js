import CONFIG from '../constants/config.js';
import articleEvents from '../events/articleEvents.js';

const { EVENT, HEARTBEAT_MS } = CONFIG.SSE;

// sse: events have no data, clients just refetch
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
    // keepalive so proxies don't drop idle connections
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

    articleEvents.on(EVENT, onChange);
    req.on('close', () => {
      clearInterval(heartbeat);
      articleEvents.off(EVENT, onChange);
    });
  };
}

export default EventsController;
