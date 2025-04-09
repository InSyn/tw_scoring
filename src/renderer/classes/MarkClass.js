import { generateId } from '../utils/utils';
import { getDisciplineCode } from '../data/sports';

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

export const extractMarkValue = (competition, mark) => {
  if (!competition || !mark) return '[?]';

  const competitionDiscipline = getDisciplineCode(competition.mainData.discipline.value || '');

  switch (competitionDiscipline) {
    case 'MO': {
      const judge = competition.stuff.judges.find((j) => j.id.toString() === mark.judge.toString());
      if (!judge) return '-';

      const mogulsRole = judge.moguls_role;
      if (mogulsRole === 'turns') {
        return `BS: ${mark.moguls_value.baseScore || 'ns'} - DD: ${mark.moguls_value.deduction || 'ns'}`;
      } else if (mogulsRole === 'jumps') {
        return `J1: ${mark.moguls_value.jump1_score || 'ns'} - J2: ${mark.moguls_value.jump2_score || 'ns'}`;
      } else {
        return '-';
      }
    }
    case 'AE':
    case 'AET': {
      return `A: ${mark.value_ae.air || 'ns'} - F: ${mark.value_ae.form || 'ns'} - L: ${mark.value_ae.landing || 'ns'}`;
    }
    default: {
      return mark.value || 'ns';
    }
  }
};
