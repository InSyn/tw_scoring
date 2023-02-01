import { generateId } from "../../../lib/utils";

export default class MarkClass {
  constructor(race, race_id, judge, judge_id, value, section) {
    this.id = generateId();

    this.judge = judge;
    this.judge_id = judge_id;
    this.new_value = null;
    this.race = race;
    this.race_id = race_id;
    this.section = section || 0;
    this.value = value || 0;
    this.value_aet = {
      air: null,
      form: null,
      landing: null,
    };
    this.aet_code = null;
  }
}
