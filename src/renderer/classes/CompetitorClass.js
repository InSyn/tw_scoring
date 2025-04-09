import { generateId } from '../utils/utils';

export default class CompetitorClass {
  constructor({ id = generateId(), ...competitorData }, marks = [], results = [], results_overall = []) {
    this.id = competitorData.bib || id;
    this.info_data = {};
    for (let competitorDataKey in competitorData) {
      this.info_data[competitorDataKey] = competitorData[competitorDataKey];
    }
    this.marks = marks;
    this.results = results;
    this.results_overall = results_overall;
  }
  race_status = null;
  res_accepted = false;
  rank = null;

  fromJSON(json) {
    this.id = json.id;
    this.info_data = json.info_data;
    this.marks = json.marks;
    this.results = json.results;
    this.results_overall = json.results_overall;
  }
}

export const generateEmptyCompetitor = () => {
  return new CompetitorClass({
    id: '',
    bib: '',
    name: '',
  });
};
