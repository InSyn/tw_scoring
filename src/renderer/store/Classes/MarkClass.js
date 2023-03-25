import { generateId } from "../../../lib/utils";

export default class MarkClass {
  constructor(race, race_id, judge, judge_id, value, ae_value) {
    this.id = generateId();

    this.judge = judge;
    this.judge_id = judge_id;
    this.new_value = null;
    this.race = race;
    this.race_id = race_id;
    this.section = 0;
    this.value = value || 0;

    this.moguls_value = {
      baseScore: null,
      deduction: null,
      jump1_code: "",
      jump1_score: null,
      jump2_code: "",
      jump2_score: null,
    };

    this.value_ae = ae_value || {
      air: null,
      form: null,
      landing: null,
    };
  }
}
