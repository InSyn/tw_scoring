import { generateId } from '../../utils/utils';

export default class SXHeatClass {
  constructor({ id = generateId(), title = 'Заезд', competitors = ['', '', '', ''], results = ['', '', '', ''] }) {
    this.id = id;
    this.title = title;
    this.competitors = competitors;
    this.results = results;
  }
}
