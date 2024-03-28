import fs from "fs";
import { roundNumber } from "../../../lib/utils";
import store from "../index";

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

  startTimer() {
    if (this.run) {
      this.run.blueCourseGap = 0;
      this.run.redCourseGap = 0;
    }

    this.startTime = new Date();
    this.isRunning = true;
    this.lastFrameTime = performance.now();

    this.animationLoop();
    this.writeFileIntervalId = setInterval(
      () => this.writeCompetitorsTimeToFile(),
      50
    );
  }

  stopTimer(timeValue) {
    this.stopTime = new Date();
    this.isRunning = false;

    clearInterval(this.writeFileIntervalId);

    store
      .dispatch("moguls/SET_MG_RUN_DATA", {
        runTime: timeValue,
      })
      .catch();
    setTimeout(() => this.writeCompetitorsTimeToFile(timeValue));
  }

  resetTimer() {
    this.stopTimer();
    this.startTime = new Date();
    this.passingTime = 0;
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
    };
    this.competitors.push(competitor);
  }
  removeCompetitor(number) {
    this.competitors = this.competitors.filter(
      (competitor) => competitor.number !== number
    );
  }

  startCompetitorTimer(competitor) {
    competitor.startTime = new Date();
    competitor.passingTime = 0;
    competitor.lastFrameTime = performance.now();
    competitor.animationLoopId = requestAnimationFrame(() =>
      this.competitorAnimationLoop(competitor)
    );
  }
  startAllCompetitorsTimer() {
    if (!this.isRunning) this.startTimer();

    this.competitors.forEach((competitor) => {
      competitor.startTime = new Date();
      competitor.passingTime = 0;
      competitor.lastFrameTime = performance.now();
      competitor.animationLoopId = requestAnimationFrame(() =>
        this.competitorAnimationLoop(competitor)
      );
    });
  }
  stopCompetitorTimer(competitor, time) {
    if (this.run) {
      const competitorObj = this.run.competitors.find(
        (runCompetitor) => runCompetitor.info_data["bib"] === competitor.number
      );
      if (!competitorObj) return;

      const course = this.run.redCourse === competitorObj.id ? "red" : "blue";

      this.run[`${course}CourseGap`] = time;
    }

    competitor.stopTime = new Date();
    cancelAnimationFrame(competitor.animationLoopId);

    setTimeout(() => {
      console.log(competitor);
    });
  }
  competitorAnimationLoop(competitor) {
    const now = performance.now();
    const elapsedMilliseconds = now - competitor.lastFrameTime;

    competitor.passingTime += elapsedMilliseconds / 1000;
    competitor.lastFrameTime = now;

    if (this.run) {
      const competitorObj = this.run.competitors.find(
        (runCompetitor) => runCompetitor.info_data["bib"] === competitor.number
      );
      if (!competitorObj) return;

      const course = this.run.redCourse === competitorObj.id ? "red" : "blue";

      this.run[`${course}CourseGap`] = roundNumber(
        competitor.passingTime,
        2
      ).toFixed(2);
    }

    competitor.animationLoopId = requestAnimationFrame(() =>
      this.competitorAnimationLoop(competitor)
    );
  }

  calculateElapsedTime() {
    const start = this.startTime ? this.startTime.getTime() : 0;
    const stop = this.stopTime ? this.stopTime.getTime() : 0;

    if (start > stop) return 0;

    const elapsedTime = (stop - start) / 1000; // Convert to seconds
    return elapsedTime.toFixed(2);
  }

  calculatePassingTime() {
    return this.passingTime.toFixed(2);
  }

  animationLoop() {
    const now = performance.now();
    const elapsedMilliseconds = now - this.lastFrameTime;

    this.passingTime += elapsedMilliseconds / 1000;
    this.lastFrameTime = now;

    if (this.run) {
      this.run.runTime = roundNumber(this.passingTime, 2).toFixed(2);
    }

    if (this.isRunning) {
      requestAnimationFrame(() => this.animationLoop());
    }
  }

  formatTime(time) {
    const rawTime = new Date(time);
    const formattedTime = rawTime.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return `${formattedTime}.${String(rawTime.getMilliseconds()).padStart(
      2,
      "0"
    )}`;
  }

  writeCompetitorsTimeToFile(timerWriteTime) {
    const minutes = Math.floor(this.passingTime / 60);
    const timeString = timerWriteTime
      ? timerWriteTime
      : `${minutes ? minutes + ":" : ""}${roundNumber(
          this.passingTime - minutes * 60,
          2
        ).toFixed(2)}`;

    fs.writeFile(
      `C:\\\\TW_Translation\\timer.txt`,
      timeString,
      // this.competitors
      //   .map(
      //     (competitor) =>
      //       `${competitor.number}||${competitor.passingTime.toFixed(2)}`
      //   )
      //   .join("\n"),
      { encoding: "utf-8" },
      (err) => {
        if (err) {
          if (err.code === "EBUSY") return;
          throw new Error(err.message);
        }
      }
    );
  }
}
