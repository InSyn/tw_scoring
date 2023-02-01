import { generateId } from "../../../lib/utils";

export default class JudgeClass {
  constructor(title, id, lastName, name, location) {
    this._id = generateId();
    this.title = title || "Judge";
    this.remoteId = null;
    this.id = id || 0;
    this.name = name || "";
    this.lastName = lastName || "";
    this.location = location || "";
    this.setABC = false;
  }
  category = "";
  socket_id = null;
  connected = false;
}
