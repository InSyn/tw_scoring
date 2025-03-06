import { generateId } from '../../utils/utils';

export default class CompetitorClass {
  constructor(fields, marks = []) {
    this.id = fields[0] && fields[0][1] !== undefined ? fields[0][1] : generateId();
    this.info_data = {};
    fields.map((field) => {
      this.info_data[field[0]] = field[1];
    });
    this.marks = marks;
    this.results = [];
    this.results_overall = [];
  }
  race_status = null;
  res_accepted = false;
  rank = null;
}

export const generateEmptyCompetitor = () => {
  // console.log(
  //   new CompetitorClass([
  //     ['id', ''],
  //     ['bib', ''],
  //     ['name', ''],
  //   ])
  // );
  return new CompetitorClass([
    ['id', ''],
    ['bib', ''],
    ['name', ''],
  ]);
};
