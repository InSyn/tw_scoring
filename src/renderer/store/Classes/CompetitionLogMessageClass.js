export class CompetitionLogMessageClass {
  constructor(args) {
    this.msgText = args.msgText || "";
    this.msgType = args.msgType || "info";
    this._msgDate = args.msgDate || Date.now();
    this.msgDate = new Date(this._msgDate);
  }
}
