import { EventEmitter } from 'node:events';

// in-process event bus, fine for a single server
const articleEvents = new EventEmitter();

// one listener per open tab, default limit of 10 is too low
articleEvents.setMaxListeners(0);

export default articleEvents;
