export default class JuryClass {
  constructor({ id = 0, title = '', ffr_id = '', lastName = '', name = '', location = '', category = '' }) {
    this.id = id;
    this.title = title;
    this.name = name;
    this.ffr_id = ffr_id;
    this.lastName = lastName;
    this.location = location;
    this.category = category;
  }
  socket_id = null;
  connected = false;
  setABC = false;
}

export const defaultRoles = ['Главный судья', 'Технический делегат', 'Старший судья', 'Главный секретарь', 'Начальник трассы'];
