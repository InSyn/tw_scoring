import { generateId } from "../../../lib/utils";

export default class EventClass {
  constructor(...args) {
    this.id = generateId();
    this.live_id = null;
    this.structure.selected.type = 0;
    this.structure.selected.discipline = 0;
    this.mainData.title.stage.group = "Group";
    this.mainData.title.stage.value = this.structure.stages[0];
    args.forEach((arg) => {
      if (typeof arg === "object") {
        if (arg.id === "competitors")
          this.competitorsSheet.competitors.push(...arg.competitors);
        if (arg.id === "judges") this.stuff.judges.push(...arg.judges);
        if (arg.id === "stage")
          this.mainData.title.stage.value = JSON.parse(
            JSON.stringify(arg.value)
          );
        else if (arg.hasOwnProperty("min"))
          this.mainData.discipline.min = arg.min;
        this.mainData[arg.id] ? (this.mainData[arg.id].value = arg.value) : 0;
      }
    });
    this.stages.stage_grid.push({
      title: this.mainData.title.stage.value.value,
      s_competitions: [this.id],
    });
  }
  competitorsSheet = {
    header: [
      { id: "bib", title: "Bib" },
      { id: "lastname", title: "Lastname" },
      { id: "name", title: "Name" },
      { id: "fullname", title: "Full name" },
      { id: "year", title: "Year" },
      { id: "rang", title: "Rang" },
      { id: "region", title: "Region" },
    ],
    competitors: [],
  };
  mainData = {
    title: {
      title: "Title",
      value: "New competition",
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
      value: "",
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
    is_aerials: true,
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
      accuracy: 1,
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
        officialsData: 12,
        openers: 12,
        weatherData: 12,
        raceNotes: 12,
      },
      protocol_type: "Start-list",
      fields: [],
    },
    result_protocols: {
      filters: {
        race_filter: null,
      },
      fonts: {
        officialsData: 12,
        openers: 12,
        weatherData: 12,
        raceNotes: 12,
      },
      protocol_type: "Results",
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
                })
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
                }) / res.length
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
                })
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
        formula: 0,
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
              let _marks = marks;
              for (
                let high = 0;
                high < +this.result_formula.types[0].higher_marks;
                high++
              ) {
                _marks.splice(_marks.indexOf(Math.max(..._marks)), 1);
              }
              for (
                let low = 0;
                low < +this.result_formula.types[0].lower_marks;
                low++
              ) {
                _marks.splice(_marks.indexOf(Math.min(..._marks)), 1);
              }
              if (this.result_formula.types[0].doubleUp)
                return (
                  (+this.result_formula.types[0].lower_marks +
                    +this.result_formula.types[0].higher_marks <
                    marks.length &&
                    _marks.reduce((a, b) => {
                      return +a + +b;
                    }) /
                      (_marks.length / 2)) ||
                  0
                );
              return (
                (+this.result_formula.types[0].lower_marks +
                  +this.result_formula.types[0].higher_marks <
                  marks.length &&
                  _marks.reduce((a, b) => {
                    return +a + +b;
                  }) /
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
              for (
                let high = 0;
                high < +this.result_formula.types[0].higher_marks;
                high++
              ) {
                marks.splice(marks.indexOf(Math.max(...marks)), 1);
              }
              for (
                let low = 0;
                low < +this.result_formula.types[0].lower_marks;
                low++
              ) {
                marks.splice(marks.indexOf(Math.min(...marks)), 1);
              }
              return (
                (+this.result_formula.types[0].lower_marks +
                  +this.result_formula.types[0].higher_marks <
                  marks.length &&
                  marks.reduce((a, b) => {
                    return +a + +b;
                  })) ||
                0
              );
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
                      .find((_comp) => {
                        return _comp.id === comp_id;
                      })
                      .marks.find((_mark) => {
                        return (
                          _mark.race_id === race_id && _mark.judge === _judge.id
                        );
                      }) &&
                      this.competitorsSheet.competitors
                        .find((_comp) => {
                          return _comp.id === comp_id;
                        })
                        .marks.find((_mark) => {
                          return (
                            _mark.race_id === race_id &&
                            _mark.judge === _judge.id
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
                        })) /
                        section.length
                    : 0
                );
              });
              return s_results.length > 0
                ? s_results.reduce((a, b) => {
                    return +a + +b;
                  })
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
    jury: [
      {
        id: "chief",
        title: "Chief judge",
        lastName: "",
        name: "",
        loc: "",
        connected: false,
        setABC: false,
      },
    ],
    judges: [],
    openers: [],
  };
  technicalInfo = {
    title: "Техническая информация",
    change_dialog: false,
    records: [
      {
        title: "Track name",
        value: "",
      },
      {
        title: "Track length",
        value: "",
      },
      {
        title: "Track width",
        value: "",
      },
    ],
  };
  weather = [
    {
      descr1: "Snow Temperature:",
      descr2: "0°",
    },
    {
      descr1: "Air Temperature:",
      descr2: "0°",
    },
    {
      descr1: "Wind Speed:",
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
    return overall ? (overall.status ? overall.status : overall.value) : 0;
  }
  getRaceResult(competitor, race) {
    const result = competitor.results.find(
      (result) => result.race_id === race.id
    );
    return result ? (result.status ? result.status : result.value) : 0;
  }
  publishResult(competitor, race_id, rep, status) {
    const res = {
      id: Math.random().toString(36).substr(2, 9),
      value: this.result_formula.types[this.result_formula.type].formulas
        .find(
          (_f) =>
            _f.id ===
            this.result_formula.types[this.result_formula.type].formula
        )
        .get_result(
          competitor.id,
          race_id,
          this.stuff.judges.map((_j) => {
            return +_j.id;
          })
        ),
      race_id: race_id,
      repeat: rep || "A",
      status: status || null,
    };
    if (!competitor.results.some((_res) => _res.race_id === race_id)) {
      competitor.results.push(res);
    } else {
      let _res = competitor.results.find((_res) => _res.race_id === race_id);
      _res.value = res.value;
    }

    this.calculateOverallResult(competitor);

    return competitor.results;
  }
  set_accuracy(val) {
    const acc = this.structure.accuracy[this.structure.selected.accuracy];
    if (typeof val === "string") return val;
    let res = (Math.round(acc.value * +val) / acc.value).toString().split(".");
    if (acc.digits > 0) {
      if (res[1]) {
        for (let i = 0; i < acc.digits - res[1].length; i++) {
          res[1] += "0";
        }
      } else {
        res.push([]);
        for (let i = 0; i < acc.digits; i++) {
          res[1] += "0";
        }
      }
    } else res = res[0];
    res = res.join(".");
    return res;
  }
}
