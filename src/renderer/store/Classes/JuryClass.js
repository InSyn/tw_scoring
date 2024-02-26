export default class JuryClass {
  constructor(title, lastName, name, location) {
    this.title = title || "";
    this.name = name || "";
    this.lastName = lastName || "";
    this.location = location || "";
  }
  category = "";
}
