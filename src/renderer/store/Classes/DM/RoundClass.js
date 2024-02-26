import RaceClass from "../RaceClass";

export default class RoundClass extends RaceClass {
  constructor(params) {
    super(params);
    this.runsNumber = 0;
    this.runs = params.runs || [];
    this.stageTitle = params.stageTitle || "";
  }
}
