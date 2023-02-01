import { generateId } from "../../../lib/utils";

export default class RaceClass {
  constructor(title, type, discipline, competitors) {
    this.id = generateId();
    this.title = title || "Race";
    this.race_dialog = false;
    this.type = type;
    this.discipline = discipline;
    this.startList = competitors || [];
    this._startList = competitors || [];
    this.selectedCompetitor = competitors[0] || null;
  }
  del_dialog = false;
  finished = [];
  onTrack = null;
}
