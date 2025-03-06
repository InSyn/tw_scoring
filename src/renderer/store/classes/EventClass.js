import { cutMarks, generateId, getAECodes, getMGCodes, roundNumber, truncateNumber } from '../../utils/utils';
import { skiRamps } from '../modules/skiRamps';
import { initTerminalData_chiefJudge } from '../../utils/terminals-utils';
import { checkCompetitionDiscipline } from '../../data/sports';
import JudgeClass from './JudgeClass';
import JuryClass, { defaultRoles } from './JuryClass';
import store from '../index';
import { athleteGendersList, getAthleteGroups } from '../../data/athlete-groups';

export const competitionDefaultSetup = {
  protocol_fields: [],
  mainData: {
    title: {
      title: 'Title',
      value: '',
      stage: {
        title: 'Stage',
        value: null,
      },
    },
    // gender: { title: 'Gender', value: athleteGendersList[1] },
    // group: { title: 'Group', value: getAthleteGroups(athleteGendersList[1]) },
    // stage: {
    //   title: 'Stage',
    //   value: '',
    // },
    discipline: {
      title: 'Discipline',
      value: '',
      min: '',
    },
    date: {
      title: 'Start date',
      dialog: false,
      value: new Date().toISOString().substring(0, 10),
      time_dialog: false,
      time: '12:00',
    },
    country: {
      title: 'Country',
      value: '',
    },
    location: {
      title: 'Place',
      value: '',
    },
    provider: {
      title: 'Organization',
      value: '',
    },
    providerTiming: {
      title: 'Provider',
      value: '',
    },
    codex: {
      title: 'Codex',
      value: '',
    },
  },
  stuff: {
    settings: {
      jury: {
        title: 'Судейская коллегия',
        change_dialog: false,
      },
      judges: {
        title: 'Судьи на линии',
        change_dialog: false,
      },
    },
    jury: [],
    judges: [],
    openers: [],
  },
  technicalInfo: {
    title: 'Техническая информация',
    change_dialog: false,
    records: [
      {
        title: 'Трасса',
        value: '',
      },
      {
        title: 'Длина трассы',
        value: 'м',
      },
      {
        title: 'Ширина трассы',
        value: 'м',
      },
      {
        title: 'Угол',
        value: '°',
      },
      {
        title: 'Установочное время',
        value: '',
      },
    ],
  },
  weather: [
    {
      descr1: 'Видимость:',
      descr2: '',
    },
    {
      descr1: 'Температура воздуха:',
      descr2: '°',
    },
    {
      descr1: 'Температура снега:',
      descr2: '°',
    },
    {
      descr1: 'Ветер:',
      descr2: '- м/с',
    },
  ],
  competitorsSheet: {
    header: [
      { id: 'bib', title: 'НН' },
      { id: 'ffr_id', title: 'ФФР-ID' },
      { id: 'name', title: 'Фамилия, Имя' },
      { id: 'year', title: 'Г.р.' },
      { id: 'rank', title: 'Разряд' },
      { id: 'region', title: 'Субъект РФ' },
      { id: 'organization', title: 'СФО' },
      // { id: 'lastname', title: 'Фамилия' },
      // { id: 'firstname', title: 'Имя' },

      // { id: 'flag', title: 'флаг' },
      // { id: 'photo_url', title: 'фото' },
      // { id: 'photo_tv_url', title: 'фото(тв)' },

      // { id: 'points', title: 'Очки' },
      // { id: "team_name", title: "Команда" },
      // { id: "jump1_code", title: "Код пр. 1" },
      // { id: "jump2_code", title: "Код пр. 2" },
    ],
    competitors: [],
  },
  teams: [],
  races: [],
  is_aerials: false,
  is_skiJumps: false,
  is_teams: false,

  protocol_settings: {
    protocol_type: 1,
    show_preview: false,
    start_protocols: {
      filters: {
        race_filter: null,
      },
      font_size: 8,
      fonts: {
        p_jury_info: 8,
        p_forerunners: 8,
        p_weather: 8,
        p_signs: 12,
        p_notations: 8,
      },
      protocol_type: 'Стартовый протокол.',
      fields: [],
    },
    result_protocols: {
      filters: {
        race_filter: null,
      },
      font_size: 8,
      fonts: {
        p_jury_info: 8,
        p_forerunners: 8,
        p_weather: 8,
        p_signs: 12,
        p_notations: 8,
      },
      protocol_type: 'Официальные результаты.',
      fields: [],
      raceResultFields: [],
    },
  },
};

export default class EventClass {
  constructor(args) {
    this.id = args.id || generateId();

    this.mainData = !this.mainData && !args.mainData ? { ...competitionDefaultSetup.mainData } : { ...this.mainData, ...args.mainData };

    if (Object.keys(args).length === 0) {
      this.structure.selected.type = 0;
      this.structure.selected.discipline = 0;
      this.mainData.title.stage.group = 'men';
      this.mainData.title.stage.value = defaultStructure.stages[0];
    }

    if (args.structure) this.structure = { ...args.structure };

    this.stuff = args.stuff ? { ...args.stuff } : { ...competitionDefaultSetup.stuff };

    if (args.competitorsSheet && args.competitorsSheet.header.length) {
      this.competitorsSheet = { ...args.competitorsSheet };
    } else {
      this.competitorsSheet = { ...competitionDefaultSetup.competitorsSheet };
    }

    this.is_aerials = args.is_aerials || false;
    this.is_skiJumps = args.is_skiJumps || false;
    this.is_teams = args.is_teams || false;
    this.passed_competitors = args.passed_competitors || 0;

    if (args.protocol_fields && args.protocol_fields.length) this.protocol_fields = [...args.protocol_fields];
    this.protocol_settings = args.protocol_settings ? { ...args.protocol_settings } : { ...competitionDefaultSetup.protocol_settings };

    this.teams = args.teams ? [...args.teams] : competitionDefaultSetup.teams;
    this.technicalInfo = args.technicalInfo ? { ...args.technicalInfo } : { ...competitionDefaultSetup.technicalInfo };
    this.weather = args.weather ? [...args.weather] : [...competitionDefaultSetup.weather];
    this.races = args.races ? [...args.races] : competitionDefaultSetup.races;

    if (args.result_formula) {
      this.result_formula.overall_result.type = args.result_formula.overall_result.type;
      this.result_formula.type = args.result_formula.type;

      if (args.result_formula.types && args.result_formula.types[0]) {
        this.result_formula.types[0].formula = args.result_formula.types[0].formula;
        this.result_formula.types[0].higher_marks = args.result_formula.types[0].higher_marks;
        this.result_formula.types[0].lower_marks = args.result_formula.types[0].lower_marks;
      }

      if (args.result_formula && args.result_formula.type && args.result_formula.types[args.result_formula.type]) {
        for (let typeKey in args.result_formula.types[args.result_formula.type]) {
          if (['cof', 'doubleUp', 'lower_marks', 'higher_marks', 'formula'].includes(typeKey)) {
            this.result_formula.types[args.result_formula.type][typeKey] = args.result_formula.types[args.result_formula.type][typeKey];
          }
        }
      }
    }

    this.ae_codes = [...getAECodes()];
    this.mg_codes = [...getMGCodes()];

    this.initDynamicData();
  }

  initDynamicData() {
    if (!this.stages.stage_grid.length) {
      this.stages.stage_grid.push({
        title: this.mainData.title.stage.value.value,
        s_competitions: [this.id],
      });
      this.stages.prev_stages.push(this.id);
    }
    if (!this.stuff.jury.length) {
      defaultRoles.forEach((role, idx) => {
        const jury = new JuryClass({ id: idx + 1, title: role, name: '', ffr_id: '', lastName: '', location: '', category: '' });
        if (jury.title === 'Старший судья') {
          jury.id = 'chief';
        }
        this.stuff.jury.push(jury);
      });
    }
    if (!this.stuff.judges.length) {
      for (let i = 0; i < 5; i++) {
        this.stuff.judges.push(new JudgeClass({ title: `Судья ${i + 1}`, id: i + 1 }));
      }
    }
  }

  structure = {
    selected: {
      type: '',
      discipline: '',
      accuracy: 2,
    },
    accuracy: [
      { id: 0, title: '1', value: 1, digits: 0 },
      { id: 1, title: '0.1', value: 10, digits: 1 },
      { id: 2, title: '0.01', value: 100, digits: 2 },
      { id: 3, title: '0.001', value: 1000, digits: 3 },
    ],
  };

  stages = {
    lastStageSize: 0,
    prev_stages: [],
    stage_grid: [],
  };

  passed_competitors = 0;
  get passedCompetitors() {
    if (this.races && this.races[this.races.length - 1]) {
      return this.races[this.races.length - 1].finished.length >= this.passed_competitors && this.passed_competitors > 0
        ? this.getSortedByRank(
            this.races[this.races.length - 1].finished.map((_comp) => this.competitorsSheet.competitors.find((_competitor) => _competitor.id === _comp))
          ).splice(0, this.passed_competitors)
        : [];
    } else return [];
  }

  result_formula = {
    overall_result: {
      type: 0,
      select_heats: {
        heats: 0,
        mode: 0,
        modes: [
          { id: 0, title: 'b_o_a' },
          { id: 1, title: 'b_o_n' },
        ],
      },
      types: [
        {
          id: 0,
          title: 'best',
          result: (comp_id) => {
            let res = [];
            const competitor = this.competitorsSheet.competitors.find((_competitor) => _competitor.id === comp_id);

            this.races.forEach((_race) => {
              const result = competitor.results.find((result) => result.race_id === _race.id);
              res.push(result ? (result.status ? 0 : result.value) : 0);
            });

            return res.length > 0 ? Math.max(...res) : 0;
          },
        },
        {
          id: 1,
          title: 'sum',
          result: (comp_id) => {
            let res = [];
            const competitor = this.competitorsSheet.competitors.find((_competitor) => _competitor.id === comp_id);

            this.races.forEach((_race) => {
              const result = competitor.results.find((result) => result.race_id === _race.id);
              res.push(result ? (result.status ? 0 : result.value) : 0);
            });

            this.result_formula.overall_result.select_heats.mode === 1 &&
              this.result_formula.overall_result.select_heats.heats > 0 &&
              (() => {
                for (let i = 0; i <= res.length - this.result_formula.overall_result.select_heats.heats; i++) {
                  res.length > 0
                    ? (res = res.filter((_res) => {
                        return _res !== Math.min(...res);
                      }))
                    : null;
                }
              })();
            return res.length > 0
              ? res.reduce((a, b) => {
                  return Number(a) + Number(b);
                }, 0)
              : 0;
          },
        },
        {
          id: 2,
          title: 'average',
          result: (comp_id) => {
            let res = [];
            const competitor = this.competitorsSheet.competitors.find((_competitor) => _competitor.id === comp_id);

            this.races.forEach((_race) => {
              const result = competitor.results.find((result) => result.race_id === _race.id);
              res.push(result ? (result.status ? 0 : result.value) : 0);
            });

            this.result_formula.overall_result.select_heats.mode === 1 &&
              this.result_formula.overall_result.select_heats.heats > 0 &&
              (() => {
                for (let i = 0; i <= res.length - this.result_formula.overall_result.select_heats.heats; i++) {
                  res.length > 0
                    ? (res = res.filter((_res) => {
                        return _res !== Math.min(...res);
                      }))
                    : 0;
                }
              })();
            return res.length > 0
              ? res.reduce((a, b) => {
                  return Number(a) + Number(b);
                }, 0) / res.length
              : 0;
          },
        },
        {
          id: 3,
          title: 'abc',
          result: (comp_id) => {
            const competitor = this.competitorsSheet.competitors.find((_comp) => _comp.id === comp_id);
            let sorted_res = [[], [], []];

            this.races.forEach((_race) => {
              const result = competitor.results.find((result) => result.race_id === _race.id);
              if (result) {
                if (!result.status) {
                  if (result.repeat === 'A') {
                    sorted_res[0].push(result);
                  } else if (result.repeat === 'B') {
                    sorted_res[1].push(result);
                  } else {
                    sorted_res[2].push(result);
                  }
                } else sorted_res[0].push(0);
              }
            });

            let res_arr = sorted_res
              .map((_results) => (_results.length > 0 ? _results.map((_res) => (_res.value ? _res.value : 0)) : [0]))
              .map((_repeated) => Math.max(..._repeated));

            if (res_arr.length > 2) res_arr = res_arr.filter((_result_to_filter) => _result_to_filter !== Math.min(...res_arr));

            return res_arr.length > 0
              ? res_arr.reduce((r1, r2) => {
                  return Number(r1) + Number(r2);
                }, 0)
              : 0;
          },
        },
      ],
    },
    type: 0,
    types: [
      {
        id: 0,
        title: 'by_judge',
        cof: 1,
        doubleUp: false,
        doubleUp_corridors: [[], []],
        doubleUp_competitors: { 0: null, 1: null },
        lower_marks: 0,
        higher_marks: 0,
        formula: 0,
        formulas: [
          {
            id: 0,
            title: 'average',
            get_result: (comp_id, race_id, judges) => {
              let marks = [];
              judges.forEach((_j) => {
                this.competitorsSheet.competitors.find((_comp) => {
                  return _comp.id === comp_id;
                })
                  ? marks.push(
                      ...this.competitorsSheet.competitors
                        .find((_comp) => {
                          return _comp.id === comp_id;
                        })
                        .marks.filter((_mark) => {
                          return +_mark.judge === +_j && _mark.race_id === race_id;
                        })
                        .map((_mark) => {
                          return +_mark.value;
                        })
                    )
                  : marks.push(0);
              });
              let _marks = cutMarks([...marks], this.result_formula.types[0].higher_marks, this.result_formula.types[0].lower_marks);

              if (this.result_formula.types[0].doubleUp)
                return (
                  (+this.result_formula.types[0].lower_marks + +this.result_formula.types[0].higher_marks < marks.length &&
                    _marks.reduce((a, b) => {
                      return Number(a) + Number(b);
                    }, 0) /
                      (_marks.length / 2)) ||
                  0
                );

              return (
                (+this.result_formula.types[0].lower_marks + +this.result_formula.types[0].higher_marks < marks.length &&
                  this.roundWithPrecision(
                    _marks.reduce((a, b) => {
                      return Number(a) + Number(b);
                    }, 0) /
                      (_marks.length / this.result_formula.types[0].cof)
                  )) ||
                0
              );
            },
          },
          {
            id: 1,
            title: 'sum',
            get_result: (comp_id, race_id, judges) => {
              let marks = [];

              judges.forEach((_j) => {
                marks.push(
                  ...this.competitorsSheet.competitors
                    .find((_comp) => {
                      return _comp.id === comp_id;
                    })
                    .marks.filter((_mark) => {
                      return +_mark.judge === +_j && _mark.race_id === race_id;
                    })
                    .map((_mark) => {
                      return +_mark.value;
                    })
                );
              });
              const _marks = cutMarks([...marks], this.result_formula.types[0].higher_marks, this.result_formula.types[0].lower_marks);

              if (parseInt(this.result_formula.types[0].lower_marks) + parseInt(this.result_formula.types[0].higher_marks) >= marks.length) {
                return 0;
              }

              return this.roundWithPrecision(
                _marks.reduce((a, b) => {
                  return Number(a) + Number(b);
                }, 0)
              );
            },
          },
          {
            id: 2,
            title: 'ae',
            get_result: (comp_id, race_id, judges, ae_code) => {
              const competitor = this.competitorsSheet.competitors.find((_comp) => {
                return _comp.id === comp_id;
              });

              const group = competitor.info_data['group'] ? competitor.info_data['group'] : this.mainData.title.stage.group || 'men';

              let marks = [];

              const aeCode = this.ae_codes.find((aeCode) => aeCode.code === ae_code);
              const ae_coef = aeCode ? Number(parseFloat(aeCode[`value_${group}`])) : 1;

              judges.forEach((judge) => {
                marks.push(
                  ...competitor.marks.filter((mark) => {
                    return mark.judge.toString() === judge.toString() && mark.race_id === race_id;
                  })
                );
              });

              const minMarksCount = Number(this.result_formula.types[0].lower_marks);
              const maxMarksCount = Number(this.result_formula.types[0].higher_marks);

              const airScores = cutMarks(
                marks.map((_mark) => {
                  return Number(_mark.value_ae.air) || 0;
                }),
                maxMarksCount,
                minMarksCount
              );
              const formScores = cutMarks(
                marks.map((_mark) => {
                  return Number(_mark.value_ae.form) || 0;
                }),
                maxMarksCount,
                minMarksCount
              );
              const landingScores = cutMarks(
                marks.map((_mark) => {
                  return Number(_mark.value_ae.landing) || 0;
                }),
                maxMarksCount,
                minMarksCount
              );

              const airSum = airScores.reduce((form1, form2) => Number(form1) + Number(form2), 0);
              const formSum = formScores.reduce((air1, air2) => Number(air1) + Number(air2), 0);
              const landingSum = landingScores.reduce((landing1, landing2) => Number(landing1) + Number(landing2), 0);

              const totalSum = roundNumber(airSum + formSum + landingSum, 1);

              if (minMarksCount + maxMarksCount >= marks.length) {
                return 0;
              }

              return this.roundWithPrecision(ae_coef * totalSum);
            },
          },
          {
            id: 3,
            title: 'moguls',
            get_result: (comp_id, race_id, judges, runParameters) => {
              if (!runParameters) return;

              const competitor = this.competitorsSheet.competitors.find((_comp) => {
                return _comp.id === comp_id;
              });
              const group = competitor.info_data['group'] ? competitor.info_data['group'] : this.mainData.title.stage.group || 'men';
              if (!competitor || !group) return 'err';

              let marks = [];

              judges.forEach((judge) => {
                marks.push(
                  ...competitor.marks.filter((mark) => {
                    return mark.judge.toString() === judge.toString() && mark.race_id === race_id;
                  })
                );
              });

              const paceTime = runParameters[`paceTime_${group}`] || 0;
              const runTime = !isNaN(Number(runParameters.runTime)) ? Number(runParameters.runTime) : 0;

              const runTimePointsSum = runTime !== 0 ? 48 - (32 * runTime) / paceTime : 0;
              const runTimePoints = runTimePointsSum >= 20 ? 20 : runTimePointsSum <= 0 ? 0 : truncateNumber(48 - (32 * runTime) / paceTime, 2);

              const turnsSum = marks
                .filter((mark) => mark.race_id === race_id && mark.moguls_value.baseScore && mark.moguls_value.deduction)
                .reduce((sum, mark) => {
                  const calculatedScore = roundNumber(Number(mark.moguls_value.baseScore) - Number(mark.moguls_value.deduction), 1);
                  const score = calculatedScore < 0.1 ? 0.1 : calculatedScore;

                  return sum + score;
                }, 0);
              const turnsResult = isNaN(turnsSum) ? 0 : truncateNumber(turnsSum, 2).toFixed(2);

              const jump1Code = this.mg_codes.find((jCode) => jCode.code === runParameters.jump1_code);
              const jump1_coef = jump1Code ? Number(jump1Code[`value_${group}`]) : 0;

              const jump2Code = this.mg_codes.find((jCode) => jCode.code === runParameters.jump2_code);
              const jump2_coef = jump2Code ? Number(jump2Code[`value_${group}`]) : 0;

              const jump1_scores = marks
                .map((mark) => (mark.moguls_value.jump1_score ? truncateNumber(mark.moguls_value.jump1_score * jump1_coef, 2) : 0))
                .filter((mark) => !!mark);
              const jump2_scores = marks
                .map((mark) => (mark.moguls_value.jump2_score ? truncateNumber(mark.moguls_value.jump2_score * jump2_coef, 2) : 0))
                .filter((mark) => !!mark);

              let judge1_jumpSum = [jump1_scores[0] || 0, jump2_scores[0] || 0].reduce((acc, val) => acc + Number(val), 0);
              if (judge1_jumpSum >= 20) judge1_jumpSum = 20;

              let judge2_jumpSum = [jump1_scores[1] || 0, jump2_scores[1] || 0].reduce((acc, val) => acc + Number(val), 0);
              if (judge2_jumpSum >= 20) judge2_jumpSum = 20;

              const jumpsSum = truncateNumber((judge1_jumpSum + judge2_jumpSum) / 2, 2);

              const result = [runTimePoints, turnsResult, jumpsSum].reduce((acc, val) => roundNumber(acc + Number(val), 2), 0);
              return result;
            },
          },
          {
            id: 4,
            title: 'ski_jumps',
            get_result: (comp_id, race_id, judges, ae_code, sj_distance, sj_ramp) => {
              let marks = [];
              const competitor = this.competitorsSheet.competitors.find((_comp) => {
                return _comp.id === comp_id;
              });

              judges.forEach((_j) => {
                marks.push(
                  ...this.competitorsSheet.competitors
                    .find((_comp) => {
                      return _comp.id === competitor.id;
                    })
                    .marks.filter((_mark) => {
                      return +_mark.judge === +_j && _mark.race_id === race_id;
                    })
                    .map((_mark) => {
                      return +_mark.value;
                    })
                );
              });

              if (+this.result_formula.types[0].lower_marks + +this.result_formula.types[0].higher_marks < marks.length) {
                marks = cutMarks([...marks], this.result_formula.types[0].higher_marks, this.result_formula.types[0].lower_marks);

                let result = marks.reduce((a, b) => {
                  return +a + +b;
                }, 0);

                return result + sj_ramp ? 60 + skiRamps[sj_ramp].lengthPoints * (parseFloat(sj_distance) - skiRamps[sj_ramp].keyPoint) + result : 0;
              }
              return 0;
            },
          },
        ],
      },
      {
        id: 1,
        title: 'by_section',
        sections: [],
        formula: 0,
        formulas: [
          {
            id: 0,
            get_result: (comp_id, race_id) => {
              let s_results = [];
              this.result_formula.types[1].sections.forEach((_section) => {
                let section = [];
                _section.judges.forEach((_judge) => {
                  section.push(
                    (this.competitorsSheet.competitors
                      .find((_comp) => _comp.id === comp_id)
                      .marks.find((_mark) => _mark.race_id === race_id && _mark.judge == _judge.id && _mark.section === _section.s_num) &&
                      this.competitorsSheet.competitors
                        .find((_comp) => {
                          return _comp.id === comp_id;
                        })
                        .marks.find((_mark) => {
                          return _mark.race_id === race_id && _mark.judge == _judge.id && _mark.section === _section.s_num;
                        }).value) ||
                      0
                  );
                });

                s_results.push(
                  section.length > 0
                    ? (_section.coefficient *
                        section.reduce((a, b) => {
                          return +a + +b;
                        }, 0)) /
                        section.length
                    : 0
                );
              });

              return s_results.length > 0
                ? this.roundWithPrecision(
                    s_results.reduce((a, b) => {
                      return +a + +b;
                    }, 0)
                  )
                : 0;
            },
          },
        ],
      },
    ],
  };

  races = [];
  selected_race_id = 0;
  get selected_race() {
    return this.races[this.selected_race_id];
  }

  ae_codes = [];
  mg_codes = [];

  async rebuildStartList(race) {
    race._startList = [...race.startList];
    race.onTrack && race._startList.unshift(race.onTrack);
    race.finished.length > 0 && race._startList.unshift(...race.finished);

    await this.refreshStartList(race);
  }
  async refreshStartList(race) {
    race.startList[0] ? (race.selectedCompetitor = race.startList[0]) : null;

    await store.dispatch('main/updateEvent');
  }
  calculateOverallResult(competitor) {
    const overallResult = {
      competition_id: this.id,
      competitor_id: competitor.id,
      value: this.roundWithPrecision(
        this.result_formula.overall_result.types.find((_f) => _f.id === this.result_formula.overall_result.type).result(competitor.id)
      ),
      status: null,
    };
    let existedResult = competitor.results_overall.find((res) => res.competition_id === overallResult.competition_id);
    existedResult ? (existedResult.value = overallResult.value) : competitor.results_overall.push(overallResult);

    return competitor.results_overall;
  }
  getSortedByRank(competitors) {
    const isSX = checkCompetitionDiscipline(this, ['SX', 'SXT']);
    const sortOrder = isSX ? -1 : 1;

    const sortedCompetitors = competitors.sort((comp1, comp2) => {
      const statuses = {
        DNF: -1,
        DNS: -2,
        DSQ: -3,
      };

      const comp1res = comp1.results_overall.find((overall) => overall.competition_id === this.id);
      const comp2res = comp2.results_overall.find((overall) => overall.competition_id === this.id);

      const comp1StatusValue = comp1res && comp1res.status ? statuses[comp1res.status] : null;
      const comp2StatusValue = comp2res && comp2res.status ? statuses[comp2res.status] : null;

      if (comp1StatusValue !== null || comp2StatusValue !== null) {
        return (comp2StatusValue || 0) - (comp1StatusValue || 0);
      }

      if (isSX) {
        const comp1IsMissingOrZero = !comp1res || comp1res.value === 0;
        const comp2IsMissingOrZero = !comp2res || comp2res.value === 0;

        if (comp1IsMissingOrZero && comp2IsMissingOrZero) return 0;
        if (comp1IsMissingOrZero) return 1;
        if (comp2IsMissingOrZero) return -1;
      }

      const comp1Value = comp1res ? comp1res.value : 0;
      const comp2Value = comp2res ? comp2res.value : 0;

      if (comp1Value === comp2Value) {
        const comp1ResultsSum = comp1.results.reduce((acc, val) => (acc + !isNaN(Number(val.value)) ? Number(val.value) : 0), 0);
        const comp2ResultsSum = comp2.results.reduce((acc, val) => (acc + !isNaN(Number(val.value)) ? Number(val.value) : 0), 0);
        return sortOrder * (comp2ResultsSum - comp1ResultsSum);
      }

      return sortOrder * (comp2Value - comp1Value);
    });

    return sortedCompetitors.map((comp, idx) => {
      const athleteOverall = comp.results_overall.find((res) => res.competition_id === this.id);

      const athletePlace = !athleteOverall || athleteOverall.status ? ' ' : athleteOverall.value ? idx + 1 : ' ';

      return {
        place: athletePlace,
        ...comp,
      };
    });
  }
  getLastLeader(currentCompetitor) {
    const sortedCompetitors = this.getSortedByRank(this.competitorsSheet.competitors);

    if (sortedCompetitors.length === 0) return null;

    const currentLeader = sortedCompetitors[0];

    if (currentCompetitor.info_data.bib !== currentLeader.info_data.bib) {
      return currentLeader;
    }

    for (let i = 1; i < sortedCompetitors.length; i++) {
      const lastLeader = sortedCompetitors[i];
      if (lastLeader.info_data.bib !== currentCompetitor.info_data.bib) {
        return lastLeader;
      }
    }

    return null;
  }
  getOverallResult(competitorId) {
    const competitor = this.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
    const overall = competitor ? competitor.results_overall.find((res) => res.competition_id === this.id) : null;
    return overall ? (overall.status ? overall.status : overall.value) : this.roundWithPrecision(0);
  }
  getRaceResult(competitor, race) {
    const result = competitor.results.find((result) => result.race_id === race.id);

    return result ? (result.status ? result.status : `${result ? result.value : 0}${result.repeat ? ' ' + result.repeat : ''}`) : this.roundWithPrecision(0);
  }
  getTeamRaceResult(team, race) {
    const teamResultsArr = team.competitors.map((competitorId) => {
      const competitor = this.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
      return competitor ? competitor.results.find((result) => result.race_id === race.id) : null;
    });

    const filteredArr = teamResultsArr.filter((result) => result && result.value);
    if (filteredArr.length > 0) {
      return this.roundWithPrecision(
        filteredArr.reduce((accumulator, res2) => {
          return accumulator + Number(res2.value);
        }, 0)
      );
    }

    return this.roundWithPrecision(0);
  }
  publishResult(params) {
    const manualResult = params.manualResult || null;

    const res = {
      id: generateId(),
      value: manualResult
        ? manualResult
        : this.result_formula.types[this.result_formula.type].formulas
            .find((formula) => formula.id === this.result_formula.types[this.result_formula.type].formula)
            .get_result(
              params.competitor.id,
              params.race_id,
              this.stuff.judges.map((_j) => {
                return +_j.id;
              }),
              this.is_aerials ? params.ae_code : checkCompetitionDiscipline(this, ['MO']) ? params.mg_parameters : null,
              params.sjDistance,
              params.sjRamp
            ),
      race_id: params.race_id,
      repeat: params.rep || null,
      status: params.status || null,
      code: params.ae_code || null,
      degree_difficulty: this.ae_codes.find((aeCode) => aeCode.code === params.ae_code)
        ? parseFloat(
            this.ae_codes.find((aeCode) => aeCode.code === params.ae_code)[
              `value_${params.competitor.info_data['group'] || this.mainData.title.stage.group || 'men'}`
            ]
          )
        : 1,

      mgRunParams: params.mg_parameters,
      sjDistance: params.sjDistance || 0,
      sjRamp: params.sjRamp || 0,
      sjGate: 0,
      sjSpeed: 0,
    };

    const existingResult = params.competitor.results.find((_res) => _res.race_id === params.race_id);

    if (!existingResult) {
      params.competitor.results.push(res);
    } else {
      for (let existingResultKey in existingResult) {
        if (res[existingResultKey] !== undefined && res[existingResultKey] !== null) existingResult[existingResultKey] = res[existingResultKey];
      }
    }

    this.calculateOverallResult(params.competitor);

    initTerminalData_chiefJudge({
      raceId: this.races.indexOf(this.races.find((race) => race.id === params.race_id)),
      competitorId: parseInt(params.competitor.info_data['bib']),
      competitorNum: parseInt(params.competitor.info_data['bib']),
      scoresQuantity: 1,
      judgesQuantity: this.stuff.judges.length,
      marks: this.stuff.judges.map((judge) => {
        return [
          judge.id,
          ...params.competitor.marks
            .filter((mark) => mark.judge_id === judge._id && mark.race_id === params.race_id)
            .map((mark) => {
              return mark.value ? parseFloat(mark.value).toFixed(1).split('.') : [0, 0];
            }),
        ];
      }),
      competitorName: params.competitor.info_data['name'] || 'Empty',
    });

    return res;
  }
  roundWithPrecision(val, digits) {
    const precision = digits ? digits : this.structure.accuracy[this.structure.selected.accuracy].digits;
    const numValue = Number(val);
    if (isNaN(numValue)) return val;

    return roundNumber(numValue, precision).toFixed(precision);
  }

  toSerializable() {
    this.races.forEach((race) => (race.runs ? race.runs.forEach((run) => (run.timer = null)) : null));

    return {
      id: this.id,
      is_aerials: this.is_aerials,
      is_skiJumps: this.is_skiJumps,
      is_teams: this.is_teams,
      mainData: this.mainData,
      structure: this.structure,
      competitorsSheet: this.competitorsSheet,
      stages: this.stages,
      passed_competitors: this.passed_competitors,
      protocol_settings: this.protocol_settings,
      stuff: this.stuff,
      teams: this.teams,
      technicalInfo: this.technicalInfo,
      weather: this.weather,
      result_formula: JSON.parse(JSON.stringify(this.result_formula)),
      selected_race_id: this.selected_race_id,
      races: this.races.map((race) => (race.toSerializable === 'function' ? race.toSerializable() : { ...race })),
    };
  }
  static fromJSON(json) {
    return new EventClass(json);
  }
}

export const defaultStructure = {
  stages: [
    { id: 'qual', title: 'Квалификация', value: 'Квалификация' },
    { id: 'final', title: 'Финал', value: 'Финал' },
    { id: 'custom', title: 'Custom', value: '' },
  ],
};
