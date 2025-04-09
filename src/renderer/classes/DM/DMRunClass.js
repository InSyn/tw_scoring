import { generateId } from '../../utils/utils';
import { generateEmptyCompetitor } from '../CompetitorClass';

export default class DMRunClass {
  constructor({ competitors = [{ ...generateEmptyCompetitor() }, { ...generateEmptyCompetitor() }], results = ['', ''], ...params }) {
    this.id = generateId();
    this.number = params.number || 0;
    this.title = params.title || '';

    this.competitors = competitors;
    this.results = results;

    this.blueCourse = competitors && competitors[0] ? competitors[0].id : '';
    this.redCourse = competitors && competitors[1] ? competitors[1].id : '';

    this.timer = null;
    this.runTime = params.runTime || 0;

    this.blueCourseTime = params.blueCourseTime || 0;
    this.redCourseTime = params.redCourseTime || 0;

    this.blueCourseGap = params.blueCourseGap || 0;
    this.redCourseGap = params.redCourseGap || 0;
  }

  serialize() {
    return {
      id: this.id,
      number: this.number,
      title: this.title,
      competitors: [...this.competitors.map((competitor) => ({ ...competitor }))],
      results: this.results,
      blueCourse: this.blueCourse,
      redCourse: this.redCourse,
      runTime: this.runTime,
      blueCourseTime: this.blueCourseTime,
      redCourseTime: this.redCourseTime,
      blueCourseGap: this.blueCourseGap,
      redCourseGap: this.redCourseGap,
    };
  }
  static createFromSerialized(serializedData) {
    return new DMRunClass(serializedData);
  }
  static setDMRunCompetitor({ competition, run, competitorId, course }) {
    if (!competition || !run || !competitorId) return;

    const index = course === 'blue' ? 0 : 1;

    const athlete = competition.competitorsSheet.competitors.find((athlete) => athlete.id === competitorId);
    if (!athlete) return;

    run.competitors[index] = athlete;
    run[`${course}Course`] = athlete.id;
  }
}

export const runResultOptions = [1, 2, 'DNS', 'DNF', 'DSQ'];
