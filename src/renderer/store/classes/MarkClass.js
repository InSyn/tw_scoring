import { generateId } from '../../utils/utils';

export default class MarkClass {
  constructor({ race, race_id, judge, judge_id, value = 0, ae_value, mg_value, section = null, isExcluded = false }) {
    this.id = generateId();

    this.race = race;
    this.race_id = race_id;

    this.judge = judge;
    this.judge_id = judge_id;

    this.section = section;

    this.value = value;
    this.new_value = null;

    this.isExcluded = false;

    this.moguls_value = mg_value || {
      baseScore: null,
      deduction: null,
      jump1_code: '',
      jump1_score: null,
      jump2_code: '',
      jump2_score: null,
    };

    this.value_ae = ae_value || {
      air: null,
      form: null,
      landing: null,
    };
  }
}
