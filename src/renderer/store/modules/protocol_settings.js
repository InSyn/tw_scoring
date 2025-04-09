import main from './../modules/main';
import { ProtocolDataFieldClass } from '../../classes/ProtocolDataFieldClass';
import { generateProtocolField } from '../../utils/protocol-utils';
import { checkCompetitionDiscipline } from '../../data/sports';

export default {
  namespaced: true,
  state: {
    export_mode: {
      menu: [
        {
          id: 'excel',
          title: 'Print EXCEL',
        },
        {
          id: 'xml',
          title: 'Print XML',
        },
        {
          id: 'pdf',
          title: 'Print PDF',
        },
      ],
      selected: 2,
    },
    results_protocol: {
      assets: {
        header_logo: {
          file: null,
          title: 'i_header',
        },
        footer_logo: {
          file: null,
          title: 'i_footer',
        },
        title_logo_left: {
          file: null,
          title: 'i_logo_left',
        },
        title_logo_right: {
          file: null,
          title: 'i_logo_right',
        },
      },
      font_size: 8,
      infoPrintChecks: {
        print_header: {
          id: 'p_jury_info',
          title: 'Print jury info',
          state: true,
        },
        print_openers: {
          id: 'p_forerunners',
          title: 'Print forerunners',
          state: false,
        },
        print_weather: {
          id: 'p_weather',
          title: 'Print weather info',
          state: false,
        },
        print_signs: {
          id: 'p_signs',
          title: 'Print signs',
          state: true,
        },
        print_notations: {
          id: 'p_notations',
          title: 'Print notations',
          state: true,
        },
      },
      layout: {
        height: 297,
        width: 210,
        padding: [5, 5],
        orientation: 'portrait',
        pdf_scale: 1,
      },
      notations:
        '<b>Расшифровка</b>:<br><b>DNS</b>: Не старт. &nbsp <b>DSQ</b>: Дисквал. &nbsp <b>DNF</b>: Не финиш. &nbsp <b>НН</b>: Нагрудный номер &nbsp <b>ФФР-ID</b>: Уникальный идентификатор &nbsp <b>СФО</b>: Спортивно-физкультурная организация &nbsp <b>РР</b>: Равенство результатов <b>Вып. разр.</b>: Выполненный разряд',
      signs: {
        left: {
          text: 'Главный судья: ',
          img: '',
        },
        center: {
          text: 'Старший судья: ',
          img: '',
        },
        right: {
          text: 'Главный сектретарь: ',
          img: '',
        },
      },
      standard_aligns: ['start', 'center', 'end'],
      string_lights: {
        odd: '#FFFFFF',
        even: '#D1D1D2',
      },
      strings_at_page: 6,
      title: '',
      use_string_light: true,
    },
  },
  getters: {
    results_protocol: (state) => state.results_protocol,
    export_mode: (state) => state.export_mode,
  },
  mutations: {
    setImage: (state, data) => {
      state.results_protocol.assets[data[0]].file = data[1].target.files[0];
    },
    initStartProtocolFields: (state, data) => {
      const result_fields = [];

      result_fields.push(generateProtocolField({ type: 'athlete:startPlace', id: 'rank', title: 'Ст.№', width: 5 }));
      data.competition.competitorsSheet.header.forEach((_header) => {
        result_fields.push(generateProtocolField({ type: 'athlete:info', id: _header.id, title: _header.title }));
      });

      data.competition.protocol_settings.start_protocols.fields = result_fields;
    },
    initResultProtocolFields: (state, data) => {
      const result_fields = [];

      //add rank
      result_fields.push(generateProtocolField({ type: 'athlete:rank', id: 'rank', title: 'Место', width: 5, f_weight: 'bold', align: 'center' }));

      //add competitors table headers
      data.competition.competitorsSheet.header.forEach((_header) => {
        result_fields.push(generateProtocolField({ type: 'athlete:info', id: _header.id, title: _header.title }));
      });

      // add ski jumps points
      if (main.state['competition'].is_skiJumps) {
        result_fields.push(generateProtocolField({ type: 'skiJump_distance', id: 'sjDistance', title: 'Дист.(м)', width: 6 }));
        result_fields.push(generateProtocolField({ type: 'skiJump_points', id: 'sjPoints', title: 'Очки д.', width: 6 }));
      }

      if (main.state['competition'].is_aerials) {
        result_fields.push(generateProtocolField({ type: 'race:title', id: 'race', title: 'Заезд', width: 6 }));
        result_fields.push(generateProtocolField({ type: 'ae_total:air', id: 'ae_air_total', title: 'Air', width: 6 }));
        result_fields.push(generateProtocolField({ type: 'ae_total:form', id: 'ae_form_total', title: 'Form', width: 6 }));
        result_fields.push(generateProtocolField({ type: 'ae_total:landing', id: 'ae_landing_total', title: 'LDG', width: 6 }));
        result_fields.push(generateProtocolField({ type: 'ae_jump:dd', id: 'jump_dd', title: 'Прыжок+DD', width: 6 }));
        result_fields.push(generateProtocolField({ type: 'ae_score:type', id: 'ae_score_type', title: '', width: 6 }));
        data.competition.stuff.judges.forEach((judge, j_idx) => {
          result_fields.push(generateProtocolField({ type: 'ae_score:value', id: `AE Judge ${j_idx + 1}`, title: `AE J${j_idx + 1}`, width: 6, judge }));
        });
        result_fields.push(generateProtocolField({ type: 'ae_score:total', id: 'ae_total', title: 'Тотал', width: 6 }));
        result_fields.push(generateProtocolField({ type: 'ae_score:total-afl', id: 'ae_totalAfl', title: 'Тотал + AFL', width: 6 }));
      } else if (checkCompetitionDiscipline(main.state['competition'], ['MO'])) {
        result_fields.push(generateProtocolField({ type: 'mg:time', id: 'mg_time', title: 'Время', font: 7, width: 5 }));
        result_fields.push(generateProtocolField({ type: 'mg:time-sum', id: 'mg_time_sum', title: 'Сумма', font: 7, width: 5 }));

        data.competition.stuff.judges.forEach((judge) => {
          if (judge.moguls_role !== 'jumps') return;
          result_fields.push(
            generateProtocolField({ type: 'mg:jumps-score', id: `mgJumps_judge_${judge.id}`, title: `С${judge.id}`, font: 7, width: 4, judge })
          );
        });
        result_fields.push(generateProtocolField({ type: 'mg:jumps-code', id: 'mg_jumps_code', title: 'Код', font: 7, width: 4 }));
        result_fields.push(generateProtocolField({ type: 'mg:jumps-coef', id: 'mg_jumps_coef', title: 'КТ', font: 7, width: 4 }));
        result_fields.push(generateProtocolField({ type: 'mg:jumps-sum', id: 'mg_jumps_sum', title: 'Прыжки', font: 7, width: 5 }));

        data.competition.stuff.judges.forEach((judge) => {
          if (judge.moguls_role !== 'turns') return;
          result_fields.push(
            generateProtocolField({ type: 'mg:turns-score', id: `mgTurns_judge_${judge.id}`, title: `С${judge.id}`, font: 7, width: 4, judge })
          );
        });
        result_fields.push(generateProtocolField({ type: 'mg:turns-sum', id: 'mg_turns_sum', title: 'Повороты', font: 7, width: 5 }));
      } else {
        result_fields.push(generateProtocolField({ type: 'race:title', id: 'race', title: 'Заезд', width: 6 }));
        data.competition.stuff.judges.forEach((judge, j_idx) => {
          result_fields.push(generateProtocolField({ type: 'judge:score', id: `Judge ${j_idx + 1}`, title: `С${j_idx + 1}`, width: 6, judge }));
        });
      }

      result_fields.push(generateProtocolField({ type: 'race:overall', id: `race_res`, title: `Оценка`, width: 5 }));
      result_fields.push(generateProtocolField({ type: 'overall', id: `result`, title: `Результат`, width: 5 }));

      data.competition.protocol_settings.result_protocols.fields = result_fields;
    },
    initRaceResultProtocolFields: (state, data) => {
      const result_fields = [];

      result_fields.push(
        new ProtocolDataFieldClass({
          width: 6,
          cell_1: {
            data: {
              id: 'rank',
              title: 'Место',
            },
            handler: function (_competitor) {
              return [_competitor.s_rank];
            },
          },
        })
      );

      data.competition.competitorsSheet.header.forEach((_header) => {
        result_fields.push(
          new ProtocolDataFieldClass({
            cell_1: {
              data: _header,
              handler: function (_competitor) {
                return [_competitor.competitor.info_data[_header.id]];
              },
            },
          })
        );
      });

      result_fields.push(
        new ProtocolDataFieldClass({
          cell_1: {
            data: { id: 'race', title: 'Заезд' },
            handler: function (competitor, competition) {
              return [competition.protocol_settings.result_protocols.filters.race_filter.title];
            },
          },
        })
      );
      if (main.state['competition'].structure.is_aerials) {
        result_fields.push(
          new ProtocolDataFieldClass({
            width: 6,
            cell_1: {
              data: {
                id: `ae_score_type`,
                title: ``,
              },
              handler: function (competitor, competition) {
                return competition.races.map(() => ['Air', 'Form', 'LDG', 'Total']);
              },
            },
          })
        );
        data.competition.stuff.judges.forEach((judge, j_idx) => {
          result_fields.push(
            new ProtocolDataFieldClass({
              width: 6,
              cell_1: {
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
                      return [_mark.value_ae.air || '-', _mark.value_ae.form || '-', _mark.value_ae.landing || '-', ' '];
                    });
                },
              },
            })
          );
        });
        result_fields.push(
          new ProtocolDataFieldClass({
            width: 6,
            cell_1: {
              data: {
                id: `ae_total`,
                title: `Тотал`,
              },
              handler: function (_competitor, competition) {
                return competition.races.map((race) => {
                  const marks = _competitor.competitor.marks.filter((mark) => mark.race_id === race.id);

                  const airSum = marks
                    .map((_mark) => {
                      return +_mark.value_ae.air || 0;
                    })
                    .reduce((form1, form2) => +form1 + +form2, 0);
                  const formSum = marks
                    .map((_mark) => {
                      return +_mark.value_ae.form || 0;
                    })
                    .reduce((air1, air2) => +air1 + +air2, 0);
                  const landingSum = marks
                    .map((_mark) => {
                      return +_mark.value_ae.landing || 0;
                    })
                    .reduce((landing1, landing2) => +landing1 + +landing2);

                  const totalSum = marks.reduce((score1, score2) => +score1 + +score2, 0);

                  return [
                    competition.roundWithPrecision(airSum),
                    competition.roundWithPrecision(formSum),
                    competition.roundWithPrecision(landingSum),
                    competition.roundWithPrecision(totalSum),
                  ];
                });
              },
            },
          })
        );
        result_fields.push(
          new ProtocolDataFieldClass({
            width: 6,
            cell_1: {
              data: {
                id: `jump_code`,
                title: `Код`,
              },
              handler: function (_competitor) {
                return _competitor.competitor.results.map((result) => [result.code || ' ', result.degree_difficulty || ' ']);
              },
            },
          })
        );
        result_fields.push(
          new ProtocolDataFieldClass({
            width: 6,
            cell_1: {
              data: {
                id: 'race_res',
                title: 'Score',
              },
              handler: function (competitor, competition) {
                return competition.races.map((_race) => {
                  const result = competitor.competitor.results.find((_res) => _res.race_id === _race.id);

                  return [
                    `${competition.roundWithPrecision(competition.getRaceResult(competitor.competitor, _race))} ${
                      competition.result_formula.overall_result.type === 3 && result ? result.repeat : ''
                    }`,
                  ];
                });
              },
            },
          })
        );
        result_fields.push(
          new ProtocolDataFieldClass({
            cell_1: {
              data: {
                id: 'result',
                title: 'Result',
              },
              handler: function (competitor) {
                const competition = main.state['competitions'].find((_comp) => _comp.id === competitor.comp_id);
                return [competition.roundWithPrecision(competition.getOverallResult(competitor.competitor.id)), ' ', ' ', ' '];
              },
            },
          })
        );
      }

      data.competition.stuff.judges.forEach((judge, j_idx) => {
        result_fields.push(
          new ProtocolDataFieldClass({
            width: 6,
            cell_1: {
              data: {
                id: `Judge ${j_idx + 1}`,
                title: `J${j_idx + 1}`,
              },
              handler: function (_competitor, competition) {
                const race = competition.protocol_settings.result_protocols.filters.race_filter;
                return (
                  _competitor.competitor.marks
                    .filter((_mark, m_idx, _marks) => {
                      return _mark.judge === judge.id && _mark.race_id === race.id;
                    })
                    .map((_mark) => {
                      return _mark.value;
                    }) || '-'
                );
              },
            },
          })
        );
      });

      result_fields.push(
        new ProtocolDataFieldClass({
          width: 6,
          cell_1: {
            data: {
              id: 'race_res',
              title: 'Result',
            },
            handler: function (competitor, competition) {
              const race = competition.protocol_settings.result_protocols.filters.race_filter;
              const result = competitor.competitor.results.find((result) => result.race_id === race.id);
              return [
                result.status ||
                  `${competition.roundWithPrecision(result.value || 0)} ${(competition.result_formula.overall_result.type === 3 && result.repeat) || ''}`,
              ];
            },
          },
        })
      );

      data.competition.protocol_settings.result_protocols.raceResultFields = result_fields;
    },
    setExportMode(state, mode) {
      state.export_mode.selected = mode;
    },
  },
  actions: {
    setExportMode({ commit }, mode) {
      commit('setExportMode', mode);
    },
  },
};
