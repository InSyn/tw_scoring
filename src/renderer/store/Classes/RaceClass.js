import { generateId } from "../../../lib/utils";

export default class RaceClass {
  constructor(params) {
    this.id = generateId();
    this.title = params.title || "Заезд";
    this.type = params.type;
    this.discipline = params.discipline;
    this.startList = params.competitors || [];
    this._startList = params.competitors || [];
    this.selectedCompetitor = params.competitors[0] || null;
    this.finished = [];
    this.onTrack = null;
  }
}
