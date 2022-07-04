import main from "./../modules/main";

export default {
  namespaced: true,
  state: {
    export_mode: {
      menu: [
        {
          id: "excel",
          title: "Печатать EXCEL",
        },
        {
          id: "xml",
          title: "Печатать XML",
        },
        {
          id: "pdf",
          title: "Печатать PDF",
        },
      ],
      selected: 2,
    },
    results_protocol: {
      standard_aligns: [
        { title: "Слева", value: "start" },
        { title: "Центр", value: "center" },
        { title: "Справа", value: "end" },
      ],
      title: "",
      use_grid: false,
      use_string_light: true,
      infoPrintChecks: {
        print_header: {
          id: "officialsData",
          title: "Печатать информацию о жюри",
          state: true,
        },
        print_openers: {
          id: "openers",
          title: "Печатать открывающих",
          state: false,
        },
        print_weather: {
          id: "weatherData",
          title: "Печатать информацию о погоде",
          state: false,
        },
        print_notations: {
          id: "raceNotes",
          title: "Печатать замечания",
          state: true,
        },
      },
      strings_at_page: 6,
      font_size: 12,
      notations:
        "<b>Легенда</b>:<br><b>DNS</b>: Did Not Start &nbsp <b>DSQ</b>: Disqualified &nbsp <b>DNF</b>: Did Not Finish",
      signs: {
        left: {
          text: "",
          img: "",
        },
        center: {
          text: "",
          img: "",
        },
        right: {
          text: "",
          img: "",
        },
      },
      string_lights: {
        odd: "#FFFFFF",
        even: "#D1D1D1",
      },
      layout: {
        height: 297,
        width: 210,
        padding: [5, 5],
        orientation: "portrait",
        pdf_scale: 1,
      },
      assets: {
        header_logo: {
          file: null,
          title: "Изображение для «шапки»",
        },
        footer_logo: {
          file: null,
          title: "Изображение для «подвала»",
        },
        title_logo: {
          file: null,
          title: "Логотип",
        },
      },
    },
    start_list: {},
    fieldClass: class {
      constructor(width, font, align, cell_1, cell_2) {
        this.id = Math.random().toString(36).substr(2, 9);
        this.params.width = width || 10;
        this.params.font = font || 12;
        this.params.f_weight = "normal";
        this.params.align = align || { title: "Слева", value: "start" };

        this.params.cell_1.id = cell_1.data.id;
        this.params.cell_1.title = cell_1.data.title;
        this.params.cell_1.handler = cell_1.handler;

        this.params.cell_2.id =
          (cell_2 && cell_2.data && cell_2.data.id) || null;
        this.params.cell_2.title =
          (cell_2 && cell_2.data && cell_2.data.title) || null;
        this.params.cell_2.handler =
          (cell_2 && cell_2.handler && cell_2.handler) ||
          function () {
            return 0;
          };
      }
      params = {
        cell_1: {
          select_dialog: false,
          id: null,
          title: null,
          handler: function () {
            return 0;
          },
        },
        cell_2: {
          select_dialog: false,
          id: null,
          title: null,
          handler: function () {
            return 0;
          },
        },
        width: null,
        font: null,
        align: null,
      };
    },
  },
  getters: {
    results_protocol: (state) => state.results_protocol,
    export_mode: (state) => state.export_mode,
    fieldClass: (state) => state.fieldClass,
  },
  mutations: {
    setImage: (state, data) => {
      state.results_protocol.assets[data[0]].file = data[1].target.files[0];
    },
    initStartProtocolFields: (state, data) => {
      const result_fields = [];

      //add start number
      result_fields.push(
        new data.fieldClass(
          6,
          12,
          {
            title: "Слева",
            value: "start",
          },
          {
            data: { id: "rank", title: "Ст №" },
            handler: function (_competitor, competition) {
              return [
                competition.protocol_settings.start_protocols.filters.race_filter._startList.indexOf(
                  _competitor.competitor.id
                ) + 1,
              ];
            },
          }
        )
      );

      //add competitors table headers
      data.competition.competitorsSheet.header.forEach((_header) => {
        result_fields.push(
          new data.fieldClass(
            12,
            12,
            { title: "Слева", value: "start" },
            {
              data: _header,
              handler: function (_competitor) {
                return [_competitor.competitor.info_data[_header.id]];
              },
            }
          )
        );
      });
      data.competition.protocol_settings.start_protocols.fields = result_fields;
    },
    initResultProtocolFields: (state, data) => {
      const result_fields = [];

      //add rank
      result_fields.push(
        new data.fieldClass(
          6,
          12,
          {
            title: "Слева",
            value: "start",
          },
          {
            data: { id: "rank", title: "Место" },
            handler: function (_competitor) {
              return [_competitor.s_rank];
            },
          }
        )
      );

      //add competitors table headers
      data.competition.competitorsSheet.header.forEach((_header) => {
        result_fields.push(
          new data.fieldClass(
            8,
            12,
            { title: "Слева", value: "start" },
            {
              data: _header,
              handler: function (_competitor) {
                return [_competitor.competitor.info_data[_header.id]];
              },
            }
          )
        );
      });

      //add race number
      result_fields.push(
        new data.fieldClass(
          8,
          12,
          {
            title: "Слева",
            value: "start",
          },
          {
            data: { id: "race", title: "Заезд" },
            handler: function (competitor) {
              const competition = main.state["competitions"].find(
                (_comp) => _comp.id === competitor.comp_id
              );
              return [...competition.races.map((race) => race.title)];
            },
          }
        )
      );

      //add judges scores
      data.competition.stuff.judges.forEach((judge, j_idx) => {
        result_fields.push(
          new data.fieldClass(
            6,
            12,
            { title: "Слева", value: "start" },
            {
              data: { id: `Судья ${j_idx + 1}`, title: `С${j_idx + 1}` },
              handler: function (_competitor) {
                return (
                  _competitor.competitor.marks
                    .filter((_mark, m_idx, _marks) => {
                      return _mark.judge === judge.id;
                    })
                    .map((_mark) => {
                      return _mark.value;
                    }) || "-"
                );
              },
            }
          )
        );
      });

      //add races scores
      result_fields.push(
        new data.fieldClass(
          6,
          12,
          {
            title: "Слева",
            value: "start",
          },
          {
            data: {
              id: "race_res",
              title: "Оценка",
            },
            handler: function (competitor) {
              const competition = main.state["competitions"].find(
                (_comp) => _comp.id === competitor.comp_id
              );
              return competition.races.map((_race) => {
                return `${competition.set_accuracy(
                  competition.getRaceResult(competitor.competitor, _race)
                )} ${
                  (competition.result_formula.overall_result.type === 3 &&
                    competitor.competitor.results.find(
                      (_res) => _res.race_id === _race.id
                    ) &&
                    competitor.competitor.results.find(
                      (_res) => _res.race_id === _race.id
                    ).repeat) ||
                  ""
                }`;
              });
            },
          }
        )
      );

      //add overall result
      result_fields.push(
        new data.fieldClass(
          8,
          12,
          {
            title: "Слева",
            value: "start",
          },
          {
            data: { id: "result", title: "Рез-т" },
            handler: function (competitor) {
              const competition = main.state["competitions"].find(
                (_comp) => _comp.id === competitor.comp_id
              );
              return [
                competition.set_accuracy(
                  competition.getResult(competitor.competitor.id)
                ),
              ];
            },
          }
        )
      );

      data.competition.protocol_settings.result_protocols.fields =
        result_fields;
    },
    initRaceResultProtocolFields: (state, data) => {
      const result_fields = [];

      //add rank
      result_fields.push(
        new data.fieldClass(
          6,
          12,
          {
            title: "Слева",
            value: "start",
          },
          {
            data: { id: "rank", title: "Место" },
            handler: function (_competitor) {
              return [_competitor.s_rank];
            },
          }
        )
      );

      //add competitors table headers
      data.competition.competitorsSheet.header.forEach((_header) => {
        result_fields.push(
          new data.fieldClass(
            8,
            12,
            { title: "Слева", value: "start" },
            {
              data: _header,
              handler: function (_competitor) {
                return [_competitor.competitor.info_data[_header.id]];
              },
            }
          )
        );
      });

      //add race number
      result_fields.push(
        new data.fieldClass(
          8,
          12,
          {
            title: "Слева",
            value: "start",
          },
          {
            data: { id: "race", title: "Заезд" },
            handler: function (competitor, competition) {
              return [
                competition.protocol_settings.result_protocols.filters
                  .race_filter.title,
              ];
            },
          }
        )
      );

      //add judges scores
      data.competition.stuff.judges.forEach((judge, j_idx) => {
        result_fields.push(
          new data.fieldClass(
            6,
            12,
            { title: "Слева", value: "start" },
            {
              data: { id: `Судья ${j_idx + 1}`, title: `С${j_idx + 1}` },
              handler: function (_competitor, competition) {
                const race =
                  competition.protocol_settings.result_protocols.filters
                    .race_filter;
                return (
                  _competitor.competitor.marks
                    .filter((_mark, m_idx, _marks) => {
                      return (
                        _mark.judge === judge.id && _mark.race_id === race.id
                      );
                    })
                    .map((_mark) => {
                      return _mark.value;
                    }) || "-"
                );
              },
            }
          )
        );
      });

      //add races scores
      result_fields.push(
        new data.fieldClass(
          6,
          12,
          {
            title: "Слева",
            value: "start",
          },
          {
            data: {
              id: "race_res",
              title: "Рез-т",
            },
            handler: function (competitor, competition) {
              const race =
                competition.protocol_settings.result_protocols.filters
                  .race_filter;
              const result = competitor.competitor.results.find(
                (result) => result.race_id === race.id
              );
              return [
                result.status ||
                  `${competition.set_accuracy(result.value || 0)} ${
                    (competition.result_formula.overall_result.type === 3 &&
                      result.repeat) ||
                    ""
                  }`,
              ];
            },
          }
        )
      );

      data.competition.protocol_settings.result_protocols.raceResultFields =
        result_fields;
    },
    setExportMode(state, mode) {
      state.export_mode.selected = mode;
    },
  },
  actions: {
    setExportMode({ commit }, mode) {
      commit("setExportMode", mode);
    },
  },
};
