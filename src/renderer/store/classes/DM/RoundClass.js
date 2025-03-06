import RaceClass from '../RaceClass';
import DMRunClass from './DMRunClass';

export default class RoundClass extends RaceClass {
  constructor({ runs = [], ...params }) {
    super(params);
    this.runs = runs.map((run) => DMRunClass.createFromSerialized(run));
    this.stageTitle = params.stageTitle || '';

    this.selectedCompetitor = this.runs[0] || null;
  }

  serialize() {
    return {
      ...super.serialize(),
      runs: this.runs.map((run) => run.serialize()),
    };
  }
}
