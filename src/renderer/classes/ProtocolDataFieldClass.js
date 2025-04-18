import { generateId } from '../utils/utils';

export class ProtocolDataFieldClass {
  constructor(args) {
    this.id = generateId();

    this.params.width = args.width || 8;
    this.params.font = args.font || 11;
    this.params.f_weight = args.f_weight || 'normal';
    this.params.align = args.align || 'start';

    this.params.cell_1.id = args.cell_1.data.id;
    this.params.cell_1.title = args.cell_1.data.title;
    this.params.cell_1.handler_type = args.cell_1.handler_type;
    this.params.cell_1.handler = args.cell_1.handler;

    this.params.cell_2.id = (args.cell_2 && args.cell_2.data && args.cell_2.data.id) || null;
    this.params.cell_2.title = (args.cell_2 && args.cell_2.data && args.cell_2.data.title) || null;
    this.params.cell_2.handler_type = args.cell_2 && args.cell_2.handler_type ? args.cell_2.handler_type : null;
    this.params.cell_2.handler =
      (args.cell_2 && args.cell_2.handler && args.cell_2.handler) ||
      function () {
        return 0;
      };
  }
  params = {
    cell_1: {
      id: null,
      title: null,
      handler_type: null,
      handler: function () {
        return 0;
      },
    },
    cell_2: {
      id: null,
      title: null,
      handler_type: null,
      handler: function () {
        return 0;
      },
    },
    width: null,
    font: null,
    align: null,
  };
}
