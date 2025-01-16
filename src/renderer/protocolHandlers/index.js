import { athleteHandlers } from './athleteHandlers';
import { raceHandlers } from './raceHandlers';
import { overallHandlers } from './overallHandlers';
import { eventHandlers } from './eventHandlers';

export const handlerRegistry = {
  ...athleteHandlers,
  ...raceHandlers,
  ...overallHandlers,
  ...eventHandlers,
};
