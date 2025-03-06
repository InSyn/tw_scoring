import { generateId } from '../../utils/utils';

export default class JudgeClass {
  constructor({ id = 0, title = 'Судья', ffr_id = '', lastName = '', name = '', location = '', category = '' }) {
    this._id = generateId();
    this.title = title;
    this.id = id;
    this.name = name;
    this.ffr_id = ffr_id;
    this.lastName = lastName;
    this.location = location;
    this.category = category;

    this.moguls_role = 'turns';
  }
  socket_id = null;
  connected = false;
  setABC = false;
}
