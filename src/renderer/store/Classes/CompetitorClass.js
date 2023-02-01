import { generateId } from "../../../lib/utils";

export default class CompetitorClass {
  constructor(fields, marks) {
    this.id = generateId();
    this.info_data = {};
    fields.map((field) => {
      this.info_data[field[0]] = field[1];
    });
    this.marks = marks || [];
    this.results = [];
    this.results_overall = [];
  }
  info_dialog = { state: false };
  race_status = null;
  res_accepted = false;
  rank = null;
}
