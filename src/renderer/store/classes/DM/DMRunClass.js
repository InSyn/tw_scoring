import { generateId } from '../../../utils/utils';
import store from '../../index';
import { generateEmptyCompetitor } from '../CompetitorClass';

const competition = store.getters['main/competition'];

export default class DMRunClass {
  constructor({ competitors = [{ ...generateEmptyCompetitor() }, { ...generateEmptyCompetitor() }], results = ['', ''], ...params }) {
    this.id = generateId();
    this.number = params.number || 0;
    this.title = params.title || '';

    this.competitors = competitors;
    this.results = results;

    this.blueCourse = params.competitors && params.competitors[0] ? params.competitors[0].id : '';
    this.redCourse = params.competitors && params.competitors[1] ? params.competitors[1].id : '';

    this.timer = null;
    this.runTime = 0;

    this.blueCourseTime = 0;
    this.redCourseTime = 0;

    this.blueCourseGap = 0;
    this.redCourseGap = 0;
  }

  addCompetitor(competitorId, index) {
    const athlete = competition.competitorsSheet.competitors.find((athlete) => athlete.id === competitorId);
    this.competitors[index] = athlete ? { ...athlete } : { ...generateEmptyCompetitor() };
  }
  removeCompetitor(competitorId, index) {
    this.competitors[index] = generateEmptyCompetitor();
  }

  setCourseTime(time, course) {
    if (course === 'blue') {
      this.blueCourseTime = time;
    } else if (course === 'red') {
      this.redCourseTime = time;
    }
  }
  setCourseGap(time, course) {
    if (course === 'blue') {
      this.blueCourseTime = time;
    } else if (course === 'red') {
      this.redCourseTime = time;
    }
  }

  setRunTime(time) {
    this.runTime = time;
  }

  setCompetitorPlace(place, index) {
    this.results[index] = place;
  }

  getCompetitorResult(index) {
    return this.results[index];
  }
}

export const runResultOptions = [1, 2, 'DNS', 'DNF', 'DSQ'];
