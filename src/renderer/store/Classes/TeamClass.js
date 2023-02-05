import { generateId } from "../../../lib/utils";

export default class TeamClass {
  constructor(params) {
    this.id = generateId();
    this.name = params.name || "";
    this.competitors = params.competitors || [];
  }
}
