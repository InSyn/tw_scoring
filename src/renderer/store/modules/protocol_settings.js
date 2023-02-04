import main from "./../modules/main";
import { generateId } from "../../../lib/utils";

export default {
  namespaced: true,
  state: {
    export_mode: {
      menu: [
        {
          id: "excel",
          title: "Print EXCEL",
        },
        {
          id: "xml",
          title: "Print XML",
        },
        {
          id: "pdf",
          title: "Print PDF",
        },
      ],
      selected: 2,
    },
    results_protocol: {
      assets: {
        header_logo: {
          file: null,
          title: "i_header",
        },
        footer_logo: {
          file: null,
          title: "i_footer",
        },
        title_logo: {
          file: null,
          title: "i_logo",
        },
      },
      font_size: 12,
      infoPrintChecks: {
        print_header: {
          id: "p_jury_info",
          title: "Print jury info",
          state: true,
        },
        print_openers: {
          id: "p_forerunners",
          title: "Print forerunners",
          state: false,
        },
        print_weather: {
          id: "p_weather",
          title: "Print weather info",
          state: false,
        },
        print_notations: {
          id: "p_notations",
          title: "Print notations",
          state: true,
        },
      },
      layout: {
        height: 297,
        width: 210,
        padding: [5, 5],
        orientation: "portrait",
        pdf_scale: 1,
      },
      notations:
        "<b>Легенда</b>:<br><b>DNS</b>: Не старт. &nbsp <b>DSQ</b>: Дисквал. &nbsp <b>DNF</b>: Не финиш.",
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
      standard_aligns: [
        { title: "Left", value: "start" },
        { title: "Center", value: "center" },
        { title: "Right", value: "end" },
      ],
      string_lights: {
        odd: "#FFFFFF",
        even: "#D1D1D1",
      },
      strings_at_page: 6,
      title: "",
      use_grid: false,
      use_string_light: true,
    },
    start_list: {},
    fieldClass: class {
      constructor(width, font, align, cell_1, cell_2) {
        this.id = generateId();
        this.params.width = width || 10;
        this.params.font = font || 12;
        this.params.f_weight = "normal";
        this.params.align = align || { title: "Left", value: "start" };

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
            title: "Left",
            value: "start",
          },
          {
            data: { id: "rank", title: "St. №" },
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
            { title: "Left", value: "start" },
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
          5,
          12,
          {
            title: "Left",
            value: "start",
          },
          {
            data: { id: "rank", title: "Rank" },
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
            { title: "Left", value: "start" },
            {
              data: _header,
              handler: function (_competitor) {
                return [_competitor.competitor.info_data[_header.id]];
              },
            }
          )
        );
      });

      //add AE judges scores
      if (main.state["competition"].structure.is_aerials) {
        //ADD AE SCORE TYPE
        result_fields.push(
          new data.fieldClass(
            6,
            12,
            { title: "Left", value: "start" },
            {
              data: {
                id: `ae_score_type`,
                title: ``,
              },
              handler: function (competitor, competition) {
                return competition.races.map((race) => [
                  "Air",
                  "Form",
                  "LDG",
                  "Total",
                ]);
              },
            }
          )
        );
        //ADD AE SCORES ARRAY
        data.competition.stuff.judges.forEach((judge, j_idx) => {
          result_fields.push(
            new data.fieldClass(
              6,
              12,
              { title: "Left", value: "start" },
              {
                data: {
                  id: `AE Judge ${j_idx + 1}`,
                  title: `AE J${j_idx + 1}`,
                },
                handler: function (_competitor) {
                  return _competitor.competitor.marks
                    .filter((_mark, m_idx, _marks) => {
                      return _mark.judge === judge.id;
                    })
                    .map((_mark) => {
                      return [
                        _mark.value_ae.air || "-",
                        _mark.value_ae.form || "-",
                        _mark.value_ae.landing || "-",
                        " ",
                      ];
                    });
                },
              }
            )
          );
        });
        //ADD AE TOTAL
        result_fields.push(
          new data.fieldClass(
            6,
            12,
            { title: "Left", value: "start" },
            {
              data: {
                id: `ae_total`,
                title: `Тотал`,
              },
              handler: function (_competitor, competition) {
                return competition.races.map((race) => {
                  const marks = _competitor.competitor.marks
                    .filter((mark) => mark.race_id === race.id)
                    .map((_mark) => {
                      return (
                        +_mark.value_ae.air +
                          +_mark.value_ae.form +
                          +_mark.value_ae.landing || ""
                      );
                    });

                  const airSum = _competitor.competitor.marks
                    .map((_mark) => {
                      return +_mark.value_ae.air || 0;
                    })
                    .reduce((form1, form2) => +form1 + +form2);
                  const formSum = _competitor.competitor.marks
                    .map((_mark) => {
                      return +_mark.value_ae.form || 0;
                    })
                    .reduce((air1, air2) => +air1 + +air2);
                  const landingSum = _competitor.competitor.marks
                    .map((_mark) => {
                      return +_mark.value_ae.landing || 0;
                    })
                    .reduce((landing1, landing2) => +landing1 + +landing2);

                  const totalSum = marks.reduce(
                    (score1, score2) => +score1 + +score2
                  );

                  return [
                    competition.set_accuracy(airSum),
                    competition.set_accuracy(formSum),
                    competition.set_accuracy(landingSum),
                    competition.set_accuracy(totalSum),
                  ];
                });
              },
            }
          )
        );
        //ADD JUMP CODE
        result_fields.push(
          new data.fieldClass(
            6,
            12,
            { title: "Left", value: "start" },
            {
              data: {
                id: `jump_code`,
                title: `Код`,
              },
              handler: function (_competitor) {
                return _competitor.competitor.results.map((result) => [
                  result.jump_code || " ",
                  result.degree_difficulty || " ",
                ]);
              },
            }
          )
        );
      }
      //CLASSIC SECTION
      else {
        //add race number
        result_fields.push(
          new data.fieldClass(
            6,
            12,
            {
              title: "Left",
              value: "start",
            },
            {
              data: { id: "race", title: "Race" },
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
              { title: "Left", value: "start" },
              {
                data: { id: `Judge ${j_idx + 1}`, title: `J${j_idx + 1}` },
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
      }

      //add races scores
      result_fields.push(
        new data.fieldClass(
          6,
          12,
          {
            title: "Left",
            value: "start",
          },
          {
            data: {
              id: "race_res",
              title: "Score",
            },
            handler: function (competitor, competition) {
              return competition.races.map((_race) => {
                const result = competitor.competitor.results.find(
                  (_res) => _res.race_id === _race.id
                );

                return [
                  `${competition.set_accuracy(
                    competition.getRaceResult(competitor.competitor, _race)
                  )} ${
                    competition.result_formula.overall_result.type === 3 &&
                    result
                      ? result.repeat
                      : ""
                  }`,
                ];
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
            title: "Left",
            value: "start",
          },
          {
            data: { id: "result", title: "Result" },
            handler: function (competitor) {
              const competition = main.state["competitions"].find(
                (_comp) => _comp.id === competitor.comp_id
              );
              return [
                competition.set_accuracy(
                  competition.getResult(competitor.competitor.id)
                ),
                " ",
                " ",
                " ",
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
            title: "Left",
            value: "start",
          },
          {
            data: { id: "rank", title: "Rank" },
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
            { title: "Left", value: "start" },
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
            title: "Left",
            value: "start",
          },
          {
            data: { id: "race", title: "Race" },
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
            { title: "Left", value: "start" },
            {
              data: { id: `Judge ${j_idx + 1}`, title: `J${j_idx + 1}` },
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
            title: "Left",
            value: "start",
          },
          {
            data: {
              id: "race_res",
              title: "Result",
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
