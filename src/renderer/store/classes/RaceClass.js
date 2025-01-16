import { generateId } from '../../utils/utils';

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
}

export const raceStatuses = ['DNS', 'DNF', 'DSQ'];

export const DMRounds = [
  { title: 'Раунд 128', quantity: 64 },
  { title: 'Раунд 64', quantity: 32 },
  { title: 'Раунд 32', quantity: 16 },
  { title: 'Раунд 16', quantity: 8 },
  { title: '1/4 финала', quantity: 4 },
  { title: '1/2 финала', quantity: 2 },
  { title: 'Малый финал', quantity: 1 },
  { title: 'Большой финал', quantity: 1 },
];
export const SXRounds = [
  { title: '1/128 финала', quantity: 128 },
  { title: '1/64 финала', quantity: 64 },
  { title: '1/32 финала', quantity: 32 },
  { title: '1/16 финала', quantity: 16 },
  { title: '1/8 финала', quantity: 8 },
  { title: '1/4 финала', quantity: 4 },
  { title: '1/2 финала', quantity: 2 },
  { title: 'Малый финал', quantity: 1 },
  { title: 'Большой финал', quantity: 1 },
];
