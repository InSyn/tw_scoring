export default {
  state: {
    startProtocol: [],
    resultProtocol: [],
    raceResultProtocol: [],
    additionalFields: []
    // fieldClass: class {
    //   constructor(width, font, align, cell_1, cell_2) {
    //     this.id = Math.random()
    //       .toString(36)
    //       .substr(2, 9);
    //     this.params.width = width || 10;
    //     this.params.font = font || 12;
    //     this.params.align = align || { title: "Слева", value: "start" };
    //
    //     this.params.cell_1.id = cell_1.data.id;
    //     this.params.cell_1.title = cell_1.data.title;
    //     this.params.cell_1.handler = cell_1.handler;
    //
    //     this.params.cell_2.id =
    //       (cell_2 && cell_2.data && cell_2.data.id) || null;
    //     this.params.cell_2.title =
    //       (cell_2 && cell_2.data && cell_2.data.title) || null;
    //     this.params.cell_2.handler =
    //       (cell_2 && cell_2.handler && cell_2.handler) ||
    //       function() {
    //         return 0;
    //       };
    //   }
    //   params = {
    //     cell_1: {
    //       select_dialog: false,
    //       id: null,
    //       title: null,
    //       handler: function() {
    //         return 0;
    //       }
    //     },
    //     cell_2: {
    //       select_dialog: false,
    //       id: null,
    //       title: null,
    //       handler: function() {
    //         return 0;
    //       }
    //     },
    //     width: null,
    //     font: null,
    //     align: null
    //   };
    // }
  },
  getters: {
    startProtocol: state => state.startProtocol,
    resultProtocol: state => state.resultProtocol,
    raceResultProtocol: state => state.raceResultProtocol,
    additionalFields: state => state.additionalFields,
    fieldClass: state => state.fieldClass
  },
  mutations: {
    // initStartProtocolFields: (state, data) => {
    //   const result_fields = [];
    //
    //   //add start number
    //   result_fields.push(
    //     new data.fieldClass(
    //       6,
    //       12,
    //       {
    //         title: "Слева",
    //         value: "start"
    //       },
    //       {
    //         data: { id: "rank", title: "Ст №" },
    //         handler: function(_competitor, competition) {
    //           return [
    //             competition.protocol_settings.start_protocols.filters.race_filter._startList.indexOf(
    //               _competitor.competitor.id
    //             ) + 1
    //           ];
    //         }
    //       }
    //     )
    //   );
    //
    //   //add competitors table headers
    //   data.competition.competitorsSheet.header.forEach(_header => {
    //     result_fields.push(
    //       new data.fieldClass(
    //         12,
    //         12,
    //         { title: "Слева", value: "start" },
    //         {
    //           data: _header,
    //           handler: function(_competitor) {
    //             return [_competitor.competitor.info_data[_header.id]];
    //           }
    //         }
    //       )
    //     );
    //   });
    //   data.competition.protocol_settings.start_protocols.fields = result_fields;
    // },
    // initResultProtocolFields: (state, data) => {
    //   const result_fields = [];
    //
    //   //add rank
    //   result_fields.push(
    //     new data.fieldClass(
    //       6,
    //       12,
    //       {
    //         title: "Слева",
    //         value: "start"
    //       },
    //       {
    //         data: { id: "rank", title: "Место" },
    //         handler: function(_competitor) {
    //           return [_competitor.s_rank];
    //         }
    //       }
    //     )
    //   );
    //
    //   //add competitors table headers
    //   data.competition.competitorsSheet.header.forEach(_header => {
    //     result_fields.push(
    //       new data.fieldClass(
    //         8,
    //         12,
    //         { title: "Слева", value: "start" },
    //         {
    //           data: _header,
    //           handler: function(_competitor) {
    //             return [_competitor.competitor.info_data[_header.id]];
    //           }
    //         }
    //       )
    //     );
    //   });
    //
    //   //add race number
    //   result_fields.push(
    //     new data.fieldClass(
    //       8,
    //       12,
    //       {
    //         title: "Слева",
    //         value: "start"
    //       },
    //       {
    //         data: { id: "race", title: "Заезд" },
    //         handler: function(competitor) {
    //           return competitor.competitor.marks
    //             .map(mark => {
    //               return mark.race_id;
    //             })
    //             .filter((value, index, self) => {
    //               return self.indexOf(value) === index;
    //             })
    //             .map((race, index) => {
    //               return `Заезд ${index + 1}`;
    //             });
    //         }
    //       }
    //     )
    //   );
    //
    //   //add judges scores
    //   data.competition.stuff.judges.forEach((judge, j_idx) => {
    //     result_fields.push(
    //       new data.fieldClass(
    //         6,
    //         12,
    //         { title: "Слева", value: "start" },
    //         {
    //           data: { id: `Судья ${j_idx + 1}`, title: `С${j_idx + 1}` },
    //           handler: function(_competitor) {
    //             return (
    //               _competitor.competitor.marks
    //                 .filter((_mark, m_idx, _marks) => {
    //                   return _mark.judge === judge.id;
    //                 })
    //                 .map(_mark => {
    //                   return _mark.value;
    //                 }) || "-"
    //             );
    //           }
    //         }
    //       )
    //     );
    //   });
    //
    //   //add races scores
    //   result_fields.push(
    //     new data.fieldClass(
    //       6,
    //       12,
    //       {
    //         title: "Слева",
    //         value: "start"
    //       },
    //       {
    //         data: {
    //           id: "race_res",
    //           title: "Оценка"
    //         },
    //         handler: function(competitor, competition) {
    //           return competition.races.map(_race => {
    //             return `${competition.getRaceResult(
    //               competitor.competitor,
    //               _race
    //             )} ${(competition.result_formula.overall_result.type === 3 &&
    //               competitor.competitor.results.find(
    //                 _res => _res.race_id === _race.id
    //               ) &&
    //               competitor.competitor.results.find(
    //                 _res => _res.race_id === _race.id
    //               ).repeat) ||
    //               ""}`;
    //           });
    //         }
    //       }
    //     )
    //   );
    //
    //   //add overall result
    //   result_fields.push(
    //     new data.fieldClass(
    //       8,
    //       12,
    //       {
    //         title: "Слева",
    //         value: "start"
    //       },
    //       {
    //         data: { id: "result", title: "Рез-т" },
    //         handler: function(competitor, competition) {
    //           return [
    //             competitor.competitor.race_status ||
    //               competition.set_accuracy(
    //                 competition.getResult(competitor.competitor.id)
    //               )
    //           ];
    //         }
    //       }
    //     )
    //   );
    //
    //   data.competition.protocol_settings.result_protocols.fields = result_fields;
    // }
  },
  actions: {
    initStartProtocolFields: ({ commit }) => commit("initStartProtocolFields"),
    initResultProtocolFields: ({ commit }) => commit("initResultProtocolFields")
  }
};
