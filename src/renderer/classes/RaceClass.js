import { generateId, getShallowCopy } from '../utils/utils';

export default class RaceClass {
  constructor(params) {
    this.id = generateId();
    this.title = params.title || 'Заезд';
    this.type = params.type;
    this.discipline = params.discipline;
    this.startList = params.competitors || [];
    this._startList = params.competitors || [];
    this.selectedCompetitor = params.competitors ? params.competitors[0] : null;
    this.finished = [];
    this.onTrack = null;
    this.heats = [...params.heats] || [];
  }

  serialize() {
    return getShallowCopy(this);
  }
}

export const raceStatuses = { DNF: -1, DNS: -2, DSQ: -3 };
export const hasStatus = (result) => {
  return Object.keys(raceStatuses).includes(result);
};

export const DMRounds = [
  { title: 'Раунд 128', quantity: 64 },
  { title: 'Раунд 64', quantity: 32 },
  { title: 'Раунд 32', quantity: 16 },
  { title: 'Раунд 16', quantity: 8 },
  { title: '1/4 финала', quantity: 4 },
  { title: '1/2 финала', quantity: 2 },
  { title: 'Финал', quantity: 2 },
];
export const SXRounds = [
  { title: '1/128 финала', quantity: 128 },
  { title: '1/64 финала', quantity: 64 },
  { title: '1/32 финала', quantity: 32 },
  { title: '1/16 финала', quantity: 16 },
  { title: '1/8 финала', quantity: 8 },
  { title: '1/4 финала', quantity: 4 },
  { title: '1/2 финала', quantity: 2 },
  { title: 'Финал', quantity: 2 },
];
