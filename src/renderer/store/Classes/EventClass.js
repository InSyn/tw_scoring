import {
  cutMarks,
  generateId,
  getAECodes,
  getMGCodes,
} from "../../../lib/utils";
import { skiRamps } from "../modules/skiRamps";
import { initTerminalData_chiefJudge } from "../terminalFunctions";

export default class EventClass {
  constructor(...args) {
    this.id = generateId();
    this.structure.selected.type = 0;
    this.structure.selected.discipline = 0;
    this.mainData.title.stage.group = "";
    this.mainData.title.stage.value = this.structure.stages[0];

    args.forEach((arg) => {
      if (typeof arg === "object") {
        if (arg.id === "competitorsSheet" && arg.headers.length) {
          this.competitorsSheet.header = [...arg.headers];
        }
        if (arg.id === "competitors") {
          this.competitorsSheet.competitors.push(...arg.competitors);
        }

        if (arg.id === "judges") {
          this.stuff.judges.push(...arg.judges);
        }
        if (arg.id === "jury") {
          this.stuff.jury.push(...arg.jury);
        }

        if (arg.id === "stage") {
          this.mainData.title.stage.value = JSON.parse(
            JSON.stringify(arg.value)
          );
        } else if (arg.hasOwnProperty("min")) {
          this.mainData.discipline.min = arg.min;
        }

        this.mainData[arg.id] ? (this.mainData[arg.id].value = arg.value) : 0;
      }
    });

    this.stages.stage_grid.push({
      title: this.mainData.title.stage.value.value,
      s_competitions: [this.id],
    });

    this.ae_codes = getAECodes() || [];
    this.mg_codes = getMGCodes() || [];
  }

  is_aerials = false;
  is_moguls = false;
  is_skiJumps = false;
  is_teams = false;

  dualMoguls_mode = true;

  competitorsSheet = {
    header: [
      { id: "bib", title: "НН" },
      { id: "lastname", title: "Фамилия" },
      { id: "name", title: "Имя" },
      { id: "fullname", title: "Фамилия, Имя" },
      { id: "year", title: "Год" },
      { id: "rank", title: "Разряд" },
      { id: "region", title: "Регион" },

      // { id: "county_name", title: "Страна" },
      // { id: "country_code", title: "Код стр." },

      // { id: "lastname_eng", title: "Lastname" },
      // { id: "name_eng", title: "Name" },
      // { id: "fullname_eng", title: "Fullname" },

      // { id: "id", title: "ID" },

      // { id: "photo", title: "Фото" },
      // { id: "country_flag", title: "Флаг" },

      // { id: "group", title: "Группа" },
      // { id: "team_name", title: "Команда" },
      // { id: "jump1_code", title: "Код пр. 1" },
      // { id: "jump2_code", title: "Код пр. 2" },
    ],
    competitors: [],
  };

  mainData = {
    title: {
      title: "Title",
      value: "Новое соревнование",
      focus: false,
      stage: {
        title: "Stage",
        value: null,
        focus: false,
      },
    },
    discipline: {
      title: "Discipline",
      value: "",
      min: "",
      focus: false,
    },
    date: {
      title: "Start date",
      dialog: false,
      value: (() => {
        let date = new Date();
        return `${date.getFullYear()}-${
          (date.getMonth() + 1).toString().length < 2
            ? "0" + (date.getMonth() + 1).toString()
            : (date.getMonth() + 1).toString()
        }-${
          date.getDate().toString().length < 2
            ? "0" + date.getDate()
            : date.getDate()
        }`;
      })(),
      time_dialog: false,
      time: "12:00",
      focus: false,
    },
    country: {
      title: "Country",
      value: "",
      focus: false,
    },
    location: {
      title: "Place",
      value: "",
      focus: false,
    },
    provider: {
      title: "Organization",
      value: "",
      focus: false,
    },
    providerTiming: {
      title: "Timing provider",
      value: "TimingWeb",
      focus: false,
    },
    codex: {
      title: "Codex",
      value: "",
      focus: false,
    },
  };

  stages = {
    lastStageSize: 0,
    prev_stages: [],
    stage_grid: [],
  };

  structure = {
    statuses: [
      {
        value: "DNF",
        priority: -1,
      },
      {
        value: "DNS",
        priority: -2,
      },
      {
        value: "DSQ",
        priority: -3,
      },
    ],
    selected: {
      type: "",
      discipline: "",
      accuracy: 2,
    },
    types: [
      { id: 0, title: "Snowboard", disciplines: [0, 1, 2, 100] },
      { id: 1, title: "Freestyle", disciplines: [0, 1, 2, 3, 4, 100] },
      { id: 2, title: "Custom", disciplines: [100] },
    ],
    disciplines: [
      { id: 0, title: "Slope-Style", res_formula: [1] },
      { id: 1, title: "Big-Air", res_formula: [2] },
      { id: 2, title: "Half-Pipe", res_formula: [3] },
      { id: 3, title: "Aerials", res_formula: [4] },
      { id: 4, title: "Moguls", res_formula: [5] },
      { id: 100, title: "Custom", res_formula: [100] },
    ],
    accuracy: [
      { id: 0, title: "1", value: 1, digits: 0 },
      { id: 1, title: "0.1", value: 10, digits: 1 },
      { id: 2, title: "0.01", value: 100, digits: 2 },
      { id: 3, title: "0.001", value: 1000, digits: 3 },
    ],
    stages: [
      { id: "qual", title: "Qualification", value: "Qualification" },
      { id: "final", title: "Final", value: "Final" },
      { id: "custom", title: "Custom", value: "" },
    ],
  };

  passed_competitors = 0;
  get passedCompetitors() {
    if (this.races && this.races[this.races.length - 1]) {
      return this.races[this.races.length - 1].finished.length >=
        this.passed_competitors && this.passed_competitors > 0
        ? this.getSortedByRank(
            this.races[this.races.length - 1].finished.map((_comp) =>
              this.competitorsSheet.competitors.find(
                (_competitor) => _competitor.id === _comp
              )
            )
          ).splice(0, this.passed_competitors)
        : [];
    } else return [];
  }

  protocol_fields = [];
  protocol_settings = {
    protocol_type: 1,
    show_preview: false,
    start_protocols: {
      filters: {
        race_filter: null,
      },
      fonts: {
        p_jury_info: 12,
        p_forerunners: 12,
        p_weather: 12,
        p_notations: 12,
      },
      protocol_type: "Старт-лист",
      fields: [],
    },
    result_protocols: {
      filters: {
        race_filter: null,
      },
      fonts: {
        p_jury_info: 12,
        p_forerunners: 12,
        p_weather: 12,
        p_notations: 12,
      },
      protocol_type: "Результаты",
      fields: [],
      raceResultFields: [],
    },
  };

  races = [];

  result_formula = {
    overall_result: {
      type: 0,
      select_heats: {
        heats: 0,
        mode: 0,
        modes: [
          { id: 0, title: "b_o_a" },
          { id: 1, title: "b_o_n" },
        ],
      },
      types: [
        {
          id: 0,
          title: "best",
          result: (comp_id) => {
            let res = [];
            const competitor = this.competitorsSheet.competitors.find(
              (_competitor) => _competitor.id === comp_id
            );

            this.races.forEach((_race) => {
              const result = competitor.results.find(
                (result) => result.race_id === _race.id
              );
              res.push(result ? (result.status ? 0 : result.value) : 0);
            });

            return res.length > 0 ? Math.max(...res) : 0;
          },
        },
        {
          id: 1,
          title: "sum",
          result: (comp_id) => {
            let res = [];
            const competitor = this.competitorsSheet.competitors.find(
              (_competitor) => _competitor.id === comp_id
            );

            this.races.forEach((_race) => {
              const result = competitor.results.find(
                (result) => result.race_id === _race.id
              );
              res.push(result ? (result.status ? 0 : result.value) : 0);
            });

            this.result_formula.overall_result.select_heats.mode === 1 &&
              this.result_formula.overall_result.select_heats.heats > 0 &&
              (() => {
                for (
                  let i = 0;
                  i <=
                  res.length -
                    this.result_formula.overall_result.select_heats.heats;
                  i++
                ) {
                  res.length > 0
                    ? (res = res.filter((_res) => {
                        return _res !== Math.min(...res);
                      }))
                    : null;
                }
              })();
            return res.length > 0
              ? res.reduce((a, b) => {
                  return +a + +b;
                }, 0)
              : 0;
          },
        },
        {
          id: 2,
          title: "average",
          result: (comp_id) => {
            let res = [];
            const competitor = this.competitorsSheet.competitors.find(
              (_competitor) => _competitor.id === comp_id
            );

            this.races.forEach((_race) => {
              const result = competitor.results.find(
                (result) => result.race_id === _race.id
              );
              res.push(result ? (result.status ? 0 : result.value) : 0);
            });

            this.result_formula.overall_result.select_heats.mode === 1 &&
              this.result_formula.overall_result.select_heats.heats > 0 &&
              (() => {
                for (
                  let i = 0;
                  i <=
                  res.length -
                    this.result_formula.overall_result.select_heats.heats;
                  i++
                ) {
                  res.length > 0
                    ? (res = res.filter((_res) => {
                        return _res !== Math.min(...res);
                      }))
                    : 0;
                }
              })();
            return res.length > 0
              ? res.reduce((a, b) => {
                  return +a + +b;
                }, 0) / res.length
              : 0;
          },
        },
        {
          id: 3,
          title: "abc",
          result: (comp_id) => {
            const competitor = this.competitorsSheet.competitors.find(
              (_comp) => _comp.id === comp_id
            );
            let sorted_res = [[], [], []];

            this.races.forEach((_race) => {
              const result = competitor.results.find(
                (result) => result.race_id === _race.id
              );
              if (result) {
                if (!result.status) {
                  if (result.repeat === "A") {
                    sorted_res[0].push(result);
                  } else if (result.repeat === "B") {
                    sorted_res[1].push(result);
                  } else {
                    sorted_res[2].push(result);
                  }
                } else sorted_res[0].push(0);
              }
            });

            let res_arr = sorted_res
              .map((_results) =>
                _results.length > 0
                  ? _results.map((_res) => (_res.value ? _res.value : 0))
                  : [0]
              )
              .map((_repeated) => Math.max(..._repeated));
            if (res_arr.length > 2)
              res_arr = res_arr.filter(
                (_result_to_filter) =>
                  _result_to_filter !== Math.min(...res_arr)
              );
            return res_arr.length > 0
              ? res_arr.reduce((r1, r2) => {
                  return +r1 + +r2;
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
        title: "by_judge",
        cof: 1,
        doubleUp: false,
        doubleUp_corridors: [[], []],
        doubleUp_competitors: { 0: null, 1: null },
        lower_marks: 0,
        higher_marks: 0,
        formula: 1,
        formulas: [
          {
            id: 0,
            title: "average",
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
                          return (
                            +_mark.judge === +_j && _mark.race_id === race_id
                          );
                        })
                        .map((_mark) => {
                          return +_mark.value;
                        })
                    )
                  : marks.push(0);
              });
              let _marks = cutMarks(
                [...marks],
                this.result_formula.types[0].higher_marks,
                this.result_formula.types[0].lower_marks
              );

              if (this.result_formula.types[0].doubleUp)
                return (
                  (+this.result_formula.types[0].lower_marks +
                    +this.result_formula.types[0].higher_marks <
                    marks.length &&
                    _marks.reduce((a, b) => {
                      return +a + +b;
                    }, 0) /
                      (_marks.length / 2)) ||
                  0
                );

              return (
                (+this.result_formula.types[0].lower_marks +
                  +this.result_formula.types[0].higher_marks <
                  marks.length &&
                  _marks.reduce((a, b) => {
                    return +a + +b;
                  }, 0) /
                    (_marks.length / this.result_formula.types[0].cof)) ||
                0
              );
            },
          },
          {
            id: 1,
            title: "sum",
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
              const _marks = cutMarks(
                [...marks],
                this.result_formula.types[0].higher_marks,
                this.result_formula.types[0].lower_marks
              );

              if (
                parseInt(this.result_formula.types[0].lower_marks) +
                  parseInt(this.result_formula.types[0].higher_marks) >=
                marks.length
              ) {
                return 0;
              }

              return _marks.reduce((a, b) => {
                return +a + +b;
              }, 0);
            },
          },
          {
            id: 2,
            title: "ae",
            get_result: (comp_id, race_id, judges, ae_code) => {
              const competitor = this.competitorsSheet.competitors.find(
                (_comp) => {
                  return _comp.id === comp_id;
                }
              );
              const group = competitor.info_data["group"]
                ? competitor.info_data["group"]
                : this.mainData.title.stage.group || "men";

              let marks = [];

              const aeCode = this.ae_codes.find(
                (aeCode) => aeCode.code === ae_code
              );

              const ae_coef = aeCode
                ? parseFloat(aeCode[`value_${group}`]).toFixed(2)
                : 1;

              // FIND MARKS
              judges.forEach((_j) => {
                marks.push(
                  ...this.competitorsSheet.competitors
                    .find((_comp) => {
                      return _comp.id === comp_id;
                    })
                    .marks.filter((_mark) => {
                      return +_mark.judge === +_j && _mark.race_id === race_id;
                    })
                );
              });

              // SPLIT AE MARKS TO ARRAYS BY MARK TYPE
              const ae_air = marks.map((mark) => mark.value_ae.air);
              const ae_form = marks.map((mark) => mark.value_ae.form);
              const ae_landing = marks.map((mark) => mark.value_ae.landing);

              // CUT HIGHER MARKS
              for (
                let high = 0;
                high < +this.result_formula.types[0].higher_marks;
                high++
              ) {
                ae_air.splice(ae_air.indexOf(Math.max(...ae_air)), 1);
                ae_form.splice(ae_form.indexOf(Math.max(...ae_form)), 1);
                ae_landing.splice(
                  ae_landing.indexOf(Math.max(...ae_landing)),
                  1
                );
              }

              // CUT LOWER MARKS
              for (
                let low = 0;
                low < +this.result_formula.types[0].lower_marks;
                low++
              ) {
                ae_air.splice(ae_air.indexOf(Math.min(...ae_air)), 1);
                ae_form.splice(ae_form.indexOf(Math.min(...ae_form)), 1);
                ae_landing.splice(
                  ae_landing.indexOf(Math.min(...ae_landing)),
                  1
                );
              }

              const resultArr = ae_air.concat(ae_form.concat(ae_landing));

              if (
                parseInt(this.result_formula.types[0].lower_marks) +
                  parseInt(this.result_formula.types[0].higher_marks) >=
                marks.length
              ) {
                return 0;
              }

              return this.set_accuracy(
                ae_coef *
                  this.set_accuracy(
                    resultArr.reduce((a, b) => {
                      return +a + +b;
                    }, 0)
                  )
              );
            },
          },
          {
            id: 3,
            title: "moguls",
            get_result: (comp_id, race_id, judges, jump_code) => {
              const competitor = this.competitorsSheet.competitors.find(
                (_comp) => {
                  return _comp.id === comp_id;
                }
              );
              const group = competitor.info_data["group"]
                ? competitor.info_data["group"]
                : this.mainData.title.stage.group || "men";

              let marks = [];

              const jumpCodeObj = this.mg_codes.find(
                (jCode) => jCode.code === jump_code
              );

              const jump_coef = jumpCodeObj
                ? parseFloat(jumpCodeObj[`value_${group}`]).toFixed(2)
                : 1;

              // FIND MARKS
              judges.forEach((_j) => {
                marks.push(
                  ...this.competitorsSheet.competitors
                    .find((_comp) => {
                      return _comp.id === comp_id;
                    })
                    .marks.filter((_mark) => {
                      return +_mark.judge === +_j && _mark.race_id === race_id;
                    })
                );
              });

              // SPLIT AE MARKS TO ARRAYS BY MARK TYPE
              const ae_air = marks.map((mark) => mark.value_ae.air);
              const ae_form = marks.map((mark) => mark.value_ae.form);
              const ae_landing = marks.map((mark) => mark.value_ae.landing);

              // CUT HIGHER MARKS
              for (
                let high = 0;
                high < +this.result_formula.types[0].higher_marks;
                high++
              ) {
                ae_air.splice(ae_air.indexOf(Math.max(...ae_air)), 1);
                ae_form.splice(ae_form.indexOf(Math.max(...ae_form)), 1);
                ae_landing.splice(
                  ae_landing.indexOf(Math.max(...ae_landing)),
                  1
                );
              }

              // CUT LOWER MARKS
              for (
                let low = 0;
                low < +this.result_formula.types[0].lower_marks;
                low++
              ) {
                ae_air.splice(ae_air.indexOf(Math.min(...ae_air)), 1);
                ae_form.splice(ae_form.indexOf(Math.min(...ae_form)), 1);
                ae_landing.splice(
                  ae_landing.indexOf(Math.min(...ae_landing)),
                  1
                );
              }

              const resultArr = ae_air.concat(ae_form.concat(ae_landing));

              if (
                parseInt(this.result_formula.types[0].lower_marks) +
                  parseInt(this.result_formula.types[0].higher_marks) >=
                marks.length
              ) {
                return 0;
              }

              return this.set_accuracy(
                jump_coef *
                  this.set_accuracy(
                    resultArr.reduce((a, b) => {
                      return +a + +b;
                    }, 0)
                  )
              );
            },
          },
          {
            id: 4,
            title: "ski_jumps",
            get_result: (
              comp_id,
              race_id,
              judges,
              ae_code,
              sj_distance,
              sj_ramp
            ) => {
              let marks = [];
              const competitor = this.competitorsSheet.competitors.find(
                (_comp) => {
                  return _comp.id === comp_id;
                }
              );

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

              if (
                +this.result_formula.types[0].lower_marks +
                  +this.result_formula.types[0].higher_marks <
                marks.length
              ) {
                marks = cutMarks(
                  [...marks],
                  this.result_formula.types[0].higher_marks,
                  this.result_formula.types[0].lower_marks
                );

                let result = marks.reduce((a, b) => {
                  return +a + +b;
                }, 0);

                return result + sj_ramp
                  ? 60 +
                      skiRamps[sj_ramp].lengthPoints *
                        (parseFloat(sj_distance) - skiRamps[sj_ramp].keyPoint) +
                      result
                  : 0;
              }
              return 0;
            },
          },
        ],
      },
      {
        id: 1,
        title: "by_section",
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
                      .marks.find(
                        (_mark) =>
                          _mark.race_id === race_id &&
                          _mark.judge === _judge.id &&
                          _mark.section === _section.s_num
                      ) &&
                      this.competitorsSheet.competitors
                        .find((_comp) => {
                          return _comp.id === comp_id;
                        })
                        .marks.find((_mark) => {
                          return (
                            _mark.race_id === race_id &&
                            _mark.judge === _judge.id &&
                            _mark.section === _section.s_num
                          );
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
                ? s_results.reduce((a, b) => {
                    return +a + +b;
                  }, 0)
                : 0;
            },
          },
        ],
      },
    ],
  };
  selected_race_id = 0;
  get selected_race() {
    return this.races[this.selected_race_id];
  }
  stuff = {
    settings: {
      jury: {
        title: "Жюри",
        change_dialog: false,
      },
      judges: {
        title: "Судьи",
        change_dialog: false,
      },
    },
    secretary: {
      name: "",
      lastName: "",
    },
    jury: [],
    judges: [],
    openers: [],
  };
  teams = [];
  technicalInfo = {
    title: "Техническая информация",
    change_dialog: false,
    records: [
      {
        title: "Трасса",
        value: "",
      },
      {
        title: "Длина трассы",
        value: "",
      },
      {
        title: "Ширина трассы",
        value: "",
      },
    ],
  };
  weather = [
    {
      descr1: "Температура снега:",
      descr2: "0°",
    },
    {
      descr1: "Температура воздуха:",
      descr2: "0°",
    },
    {
      descr1: "Скорость ветра:",
      descr2: "",
    },
  ];

  calculateOverallResult(competitor) {
    const overallResult = {
      competition_id: this.id,
      competitor_id: competitor.id,
      value: this.result_formula.overall_result.types
        .find((_f) => _f.id === this.result_formula.overall_result.type)
        .result(competitor.id),
      status: null,
    };
    let existedResult =
      competitor.results_overall.find(
        (res) => res.competition_id === overallResult.competition_id
      ) || null;
    existedResult
      ? (existedResult.value = overallResult.value)
      : competitor.results_overall.push(overallResult);

    return competitor.results_overall;
  }
  getSortedByRank(competitors) {
    return competitors.sort((comp1, comp2) => {
      const statuses = {
        DNF: -1,
        DNS: -2,
        DSQ: -3,
      };
      const comp1res = comp1.results_overall.find(
          (overall) => overall.competition_id === this.id
        ),
        comp2res = comp2.results_overall.find(
          (overall) => overall.competition_id === this.id
        );
      return (
        (comp2res
          ? comp2res.status
            ? statuses[comp2res.status]
            : comp2res.value
          : 0) -
        (comp1res
          ? comp1res.status
            ? statuses[comp1res.status]
            : comp1res.value
          : 0)
      );
    });
  }
  getResult(competitor_id) {
    const competitor = this.competitorsSheet.competitors.find(
      (_competitor) => _competitor.id === competitor_id
    );
    const overall = competitor
      ? competitor.results_overall.find((res) => res.competition_id === this.id)
      : null;
    return overall
      ? overall.status
        ? overall.status
        : this.set_accuracy(overall.value)
      : this.set_accuracy(0);
  }
  getRaceResult(competitor, race) {
    const result = competitor.results.find(
      (result) => result.race_id === race.id
    );

    return result
      ? result.status
        ? result.status
        : `${this.set_accuracy(result ? result.value : 0)}${
            result.repeat ? " " + result.repeat : ""
          }`
      : this.set_accuracy(0);
  }
  getTeamRaceResult(team, race) {
    const teamResultsArr = team.competitors.map((competitorId) => {
      const competitor = this.competitorsSheet.competitors.find(
        (competitor) => competitor.id === competitorId
      );

      return competitor
        ? competitor.results.find((result) => result.race_id === race.id)
        : null;
    });

    const filteredArr = teamResultsArr.filter(
      (result) => result && result.value
    );

    if (filteredArr.length > 0) {
      return this.set_accuracy(
        filteredArr.reduce((accumulator, res2) => {
          return accumulator + +res2.value;
        }, 0)
      );
    }
    return this.set_accuracy(0);
  }
  publishResult(params) {
    const res = {
      id: generateId(),
      value: this.result_formula.types[this.result_formula.type].formulas
        .find(
          (formula) =>
            formula.id ===
            this.result_formula.types[this.result_formula.type].formula
        )
        .get_result(
          params.competitor.id,
          params.race_id,
          this.stuff.judges.map((_j) => {
            return +_j.id;
          }),
          params.ae_code,
          params.sjDistance,
          params.sjRamp,
          params.mgTime,
          params.mgCode
        ),
      race_id: params.race_id,
      repeat: params.rep || null,
      status: params.status || null,
      jump_code: params.ae_code || null,
      degree_difficulty: this.ae_codes.find(
        (aeCode) => aeCode.code === params.ae_code
      )
        ? parseFloat(
            this.ae_codes.find((aeCode) => aeCode.code === params.ae_code)[
              `value_${
                params.competitor.info_data["group"] ||
                this.mainData.title.stage.group ||
                "men"
              }`
            ]
          )
        : 1,

      sjDistance: params.sjDistance || 0,
      sjRamp: params.sjRamp || 0,
      sjGate: 0,
      sjSpeed: 0,
    };
    if (
      !params.competitor.results.some((_res) => _res.race_id === params.race_id)
    )
      params.competitor.results.push(res);
    else {
      let _res = params.competitor.results.find(
        (_res) => _res.race_id === params.race_id
      );
      _res.value = res.value;
    }

    this.calculateOverallResult(params.competitor);

    initTerminalData_chiefJudge({
      raceId: this.races.indexOf(
        this.races.find((race) => race.id === params.race_id)
      ),
      competitorId: parseInt(params.competitor.info_data["bib"]),
      competitorNum: parseInt(params.competitor.info_data["bib"]),
      scoresQuantity: 1,
      judgesQuantity: this.stuff.judges.length,
      marks: this.stuff.judges.map((judge) => {
        return [
          judge.id,
          ...params.competitor.marks
            .filter(
              (mark) =>
                mark.judge_id === judge._id && mark.race_id === params.race_id
            )
            .map((mark) => {
              return mark.value
                ? parseFloat(mark.value).toFixed(1).split(".")
                : [0, 0];
            }),
        ];
      }),
      competitorName: params.competitor.info_data["fullname"] || "Empty",
    });

    return params.competitor.results;
  }
  set_accuracy(val) {
    const accuracy = this.structure.accuracy[this.structure.selected.accuracy];
    if (typeof val === "string") return val;
    let resultArray = (Math.round(accuracy.value * +val) / accuracy.value)
      .toString()
      .split(".");
    if (accuracy.digits > 0) {
      if (resultArray[1]) {
        for (let i = 0; i < accuracy.digits - resultArray[1].length; i++) {
          resultArray[1] += "0";
        }
      } else {
        resultArray.push([]);
        for (let i = 0; i < accuracy.digits; i++) {
          resultArray[1] += "0";
        }
      }
    } else resultArray = resultArray[0];
    resultArray = resultArray.join(".");
    return resultArray;
  }
}
