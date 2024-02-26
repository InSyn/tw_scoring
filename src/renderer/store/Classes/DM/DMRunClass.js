import { generateId } from "../../../../lib/utils";

export default class DMRunClass {
  constructor(params) {
    this.id = generateId();
    this.number = params.number || 0;
    this.competitors = params.competitors || [];

    this.blueCourse = params.competitors[0] ? params.competitors[0].id : null;
    this.redCourse = params.competitors[1] ? params.competitors[1].id : null;

    this.timer = null;
    this.runTime = 0;

    this.blueCourseGap = 0;
    this.redCourseGap = 0;
  }
}
