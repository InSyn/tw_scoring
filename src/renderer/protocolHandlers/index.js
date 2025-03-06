import { athleteHandlers } from './athleteHandlers';
import { raceHandlers } from './raceHandlers';
import { overallHandlers } from './overallHandlers';
import { eventHandlers } from './eventHandlers';
import { protocolHandlers } from './protocolHandlers';

export const handlerRegistry = {
  ...athleteHandlers,
  ...raceHandlers,
  ...overallHandlers,
  ...eventHandlers,
  ...protocolHandlers,
};
