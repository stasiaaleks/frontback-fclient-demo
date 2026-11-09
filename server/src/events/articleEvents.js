import { EventEmitter } from 'node:events';

// In-process bus: the service announces changes, the SSE route forwards them to browsers.
// Works for a single server process, which is all this project runs.
const articleEvents = new EventEmitter();

// Every open browser tab adds a listener, so the default limit of 10 is too low
articleEvents.setMaxListeners(0);

export default articleEvents;
