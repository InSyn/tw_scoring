import fs from 'fs';
import { roundNumber } from '../utils/utils';
import { calculateTimeDifference } from '../utils/timing-utils';

export default class TimerClass {
  constructor(run) {
    this.isRunning = false;
    this.startTime = null;
    this.stopTime = null;
    this.lastFrameTime = null;
    this.passingTime = 0;
    this.writeFileIntervalId = null;
    this.competitors = [];
    this.run = run || null;
  }

  startTimer(timer_timeString) {
    if (this.run) {
      this.run.blueCourseGap = 0;
      this.run.redCourseGap = 0;
      this.run.blueCourseTime = 0;
      this.run.redCourseTime = 0;
      this.run.runTime = 0;
    }

    this.passingTime = 0;
    this.startTime = timer_timeString ? timer_timeString : Date.now();
    this.isRunning = true;
    this.lastFrameTime = performance.now();

    this.animationLoop();
    this.writeFileIntervalId = setInterval(() => this.writeTimeDataToFile(), 50);
  }

  stopTimer(timer_timeString) {
    clearInterval(this.writeFileIntervalId);
    this.isRunning = false;

    this.stopTime = timer_timeString ? timer_timeString : Date.now();

    const runTime = calculateTimeDifference(this.startTime, this.stopTime);
    this.run.runTime = roundNumber(runTime / 1000, 2)
      .toString()
      .padEnd(2, '0');

    this.competitors.forEach((competitor) => {
      if (competitor.animationLoopId) {
        cancelAnimationFrame(competitor.animationLoopId);
        competitor.animationLoopId = null;
      }
    });

    this.writeTimeDataToFile(runTime);
  }

  resetTimer() {
    this.stopTimer();
    this.startTime = null;
    this.stopTime = null;
    this.passingTime = 0;
  }

  animationLoop() {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsedMilliseconds = now - this.lastFrameTime;

    this.passingTime += elapsedMilliseconds / 1000;
    this.lastFrameTime = now;

    if (this.run) {
      this.run.runTime = roundNumber(this.passingTime, 2);
    }

    requestAnimationFrame(() => this.animationLoop());
  }

  addCompetitor(number) {
    if (this.competitors.some((competitor) => competitor.number === number)) {
      return;
    }

    const competitor = {
      number,
      startTime: null,
      stopTime: null,
      passingTime: 0,
      gap: null,
      course: null,
    };
    this.competitors.push(competitor);
  }

  removeCompetitor(number) {
    this.competitors = this.competitors.filter((competitor) => competitor.number !== number);
  }

  startCompetitorTimer(competitor, timer_timeString) {
    const competitorObj = this.run.competitors.find((runCompetitor) => runCompetitor.info_data['bib'] === competitor.number);
    if (competitorObj) {
      competitor.course = this.run.redCourse === competitorObj.id ? 'red' : 'blue';
    }

    if (this.run) {
      this.run[`${competitor.course}CourseTime`] = 0;
      this.run[`${competitor.course}CourseGap`] = 0;
    }

    if (competitor.animationLoopId) {
      cancelAnimationFrame(competitor.animationLoopId);
    }

    competitor.startTime = timer_timeString;
    competitor.passingTime = 0;
    competitor.lastFrameTime = performance.now();
    competitor.animationLoopId = requestAnimationFrame(() => this.competitorAnimationLoop(competitor));
  }

  startAllCompetitorsTimer() {
    if (!this.isRunning) this.startTimer();

    this.competitors.forEach((competitor) => {
      this.startCompetitorTimer(competitor);
    });
  }

  stopCompetitorTimer(competitor, timer_timeString) {
    if (!this.run) return;

    competitor.stopTime = timer_timeString;
    cancelAnimationFrame(competitor.animationLoopId);
    competitor.passingTime = calculateTimeDifference(this.startTime, timer_timeString);

    this.run[`${competitor.course}CourseTime`] = competitor.passingTime;

    const opponentCourse = competitor.course === 'red' ? 'blue' : 'red';
    const opponentTime = this.run[`${opponentCourse}CourseTime`];

    if (opponentTime !== undefined) {
      const gap = calculateTimeDifference(competitor.startTime, competitor.stopTime);
      competitor.gap = roundNumber(gap / 1000, 2);

      this.run[`${competitor.course}CourseGap`] = competitor.gap;
    }
  }

  competitorAnimationLoop(competitor) {
    const now = performance.now();
    const elapsedMilliseconds = now - competitor.lastFrameTime;

    competitor.passingTime += elapsedMilliseconds / 1000;
    competitor.lastFrameTime = now;

    if (this.run) {
      this.run[`${competitor.course}CourseTime`] = competitor.passingTime;

      const opponentCourse = competitor.course === 'red' ? 'blue' : 'red';
      const opponentTime = this.run[`${opponentCourse}CourseTime`];

      if (opponentTime !== undefined) {
        const gap = Number(competitor.passingTime) - Number(opponentTime);
        competitor.gap = roundNumber(gap, 2);
        this.run[`${competitor.course}CourseGap`] = competitor.gap;
      }
    }

    competitor.animationLoopId = requestAnimationFrame(() => this.competitorAnimationLoop(competitor));
  }

  calculateElapsedTime() {
    const start = this.startTime ? this.startTime.getTime() : 0;
    const stop = this.stopTime ? this.stopTime.getTime() : 0;

    if (start > stop) return 0;

    const elapsedTime = (stop - start) / 1000;
    return roundNumber(elapsedTime, 2);
  }

  calculatePassingTime() {
    return roundNumber(this.passingTime, 2);
  }

  formatTime(time) {
    const rawTime = new Date(time);
    const formattedTime = rawTime.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return `${formattedTime}.${String(rawTime.getMilliseconds()).padStart(2, '0')}`;
  }

  writeTimeDataToFile(timeValue) {
    const rawTime = timeValue ? timeValue / 1000 : this.passingTime;
    const minutes = Math.floor(rawTime / 60);
    const timeString = `${minutes ? minutes + ':' : ''}${roundNumber(rawTime - minutes * 60, 1).toFixed(1)}`;

    fs.writeFile('C:\\TW_Translation\\timer.txt', timeString, { encoding: 'utf-8' }, (err) => {
      if (err) {
        if (err.code === 'EBUSY') return;
        console.error(`Error writing to file: ${err.message}`);
      }
    });
  }
}
