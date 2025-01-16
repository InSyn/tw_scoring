import RaceClass from '../RaceClass';

export default class RoundClass extends RaceClass {
  constructor({ runs = [], ...params }) {
    super(params);
    this.runs = [...runs];
    this.stageTitle = params.stageTitle || '';

    this.selectedCompetitor = this.runs[0] || null;
  }
}
