import competitors from "../../components/competitors";

export default {
  namespaced: true,
  state: {
    EventClass: class {
      constructor(...args) {
        this.id = Math.random()
          .toString(36)
          .substr(2, 9);
        this.structure.selected.type = 0;
        this.structure.selected.discipline = 0;
        this.mainData.title.stage.value = this.structure.stages[0];
        args.forEach(arg => {
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
            this.mainData[arg.id]
              ? (this.mainData[arg.id].value = arg.value)
              : 0;
          }
        });
        this.stages.stage_grid.push({
          title: this.mainData.title.stage.value.value,
          s_competitions: [this.id]
        });
      }
      weather = [];
      structure = {
        selected: {
          type: "",
          discipline: "",
          accuracy: 1
        },
        types: [
          { id: 0, title: "Сноуборд", disciplines: [0, 1, 2, 100] },
          { id: 1, title: "Фристайл", disciplines: [0, 1, 2, 3, 4, 100] },
          { id: 2, title: "Пользовательский", disciplines: [100] }
        ],
        disciplines: [
          { id: 0, title: "Слоуп-Стайл", res_formula: [1] },
          { id: 1, title: "Биг-Эйр", res_formula: [2] },
          { id: 2, title: "Хаф-Пайп", res_formula: [3] },
          { id: 3, title: "Акробатика", res_formula: [4] },
          { id: 4, title: "Могул", res_formula: [5] },
          { id: 100, title: "Пользовательский", res_formula: [100] }
        ],
        accuracy: [
          { id: 0, title: "1", value: 1, digits: 0 },
          { id: 1, title: "1:10", value: 10, digits: 1 },
          { id: 2, title: "1:100", value: 100, digits: 2 },
          { id: 3, title: "1:1000", value: 1000, digits: 3 }
        ],
        stages: [
          { id: "qual", title: "Квалификация", value: "Квалификация" },
          { id: "final", title: "Финал", value: "Финал" },
          { id: "custom", title: "Пользовательский", value: "" }
        ]
      };
      set_accuracy(val) {
        const acc = this.structure.accuracy[this.structure.selected.accuracy];
        let res = (Math.round(acc.value * +val) / acc.value)
          .toString()
          .split(".");
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
      stages = {
        lastStageSize: 0,
        prev_stages: [],
        stage_grid: []
      };
      passed_competitors = 0;
      races = [];
      selected_race_id = 0;
      get selected_race() {
        return this.races[this.selected_race_id];
      }
      mainData = {
        title: {
          title: "Название",
          value: "Новое соревнование",
          focus: false,
          stage: {
            title: "Этап",
            value: null,
            focus: false
          }
        },
        discipline: {
          title: "Дисциплина",
          value: "",
          min: "",
          focus: false
        },
        date: {
          title: "Дата проведения",
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
          focus: false
        },
        country: {
          title: "Страна",
          value: "",
          focus: false
        },
        location: {
          title: "Место проведения",
          value: "",
          focus: false
        },
        provider: {
          title: "Организатор",
          value: "",
          focus: false
        },
        providerTiming: {
          title: "Timing provider",
          value: "",
          focus: false
        },
        codex: {
          title: "Codex",
          value: "0000",
          focus: false
        }
      };
      stuff = {
        secretary: {
          name: "",
          surName: ""
        },
        jury: [
          {
            title: "Старший судья",
            surName: "Фамилия",
            name: "Имя",
            loc: "Город",
            connected: false
          }
        ],
        judges: [],
        openers: []
      };
      technicalInfo = [
        {
          title: "Название склона",
          value: ""
        },
        {
          title: "Длина трассы",
          value: ""
        },
        {
          title: "Ширина трассы",
          value: ""
        }
      ];
      competitorsSheet = {
        header: [
          { id: "bib", title: "Bib" },
          { id: "fiscode", title: "FIS код" },
          { id: "surname", title: "Фамилия" },
          { id: "name", title: "Имя" },
          { id: "year", title: "Год" },
          { id: "rang", title: "Разряд" },
          { id: "location", title: "Регион" }
        ],
        competitors: []
      };
      getSortedByRank(competitors) {
        return competitors.sort((c1, c2) => {
          return this.getResult(c2.id) - this.getResult(c1.id);
        });
      }
      get passedCompetitors() {
        if (this.races && this.races[this.races.length - 1]) {
          return this.races[this.races.length - 1].finished.length >=
            this.passed_competitors && this.passed_competitors > 0
            ? this.getSortedByRank(
                this.races[this.races.length - 1].finished.map(_comp =>
                  this.competitorsSheet.competitors.find(
                    _competitor => _competitor.id === _comp
                  )
                )
              ).splice(0, this.passed_competitors)
            : [];
        } else return [];
      }
      media_settings = {
        display: {
          modes: [
            { id: 0, title: "Результаты" },
            { id: 1, title: "Стартовый" },
            { id: 2, title: "Результат последнего на финише" },
            { id: 3, title: "Участник на старте" },
            { id: 4, title: "Награждение" }
          ],
          selected: 1
        }
      };
      getResult(competitor_id) {
        const competitor = this.competitorsSheet.competitors.find(
          _competitor => _competitor.id === competitor_id
        );
        return competitor
          ? competitor.race_status ||
              this.set_accuracy(
                this.result_formula.overall_result.types
                  .find(_f => {
                    return _f.id === this.result_formula.overall_result.type;
                  })
                  .result(competitor_id)
              )
          : 0;
      }
      getRaceResult(competitor_id, race_id) {}
      protocol_fields = [];
      protocol_settings = {
        protocol_type: 0,
        show_preview: false,
        start_protocols: {
          result_race: null,
          fields: []
        },
        result_protocols: {
          result_race: null,
          fields: []
        }
      };
      result_formula = {
        overall_result: {
          type: 1,
          select_heats: {
            heats: 0,
            mode: 0,
            modes: [
              { id: 0, title: "Подсчёт из всех" },
              { id: 1, title: "Подсчёт из N лучших" }
            ]
          },
          types: [
            {
              id: 0,
              title: "Лучший",
              result: comp_id => {
                let res = [];
                this.races.forEach(_race => {
                  res.push(
                    this.result_formula.types[this.result_formula.type].formulas
                      .find(_f => {
                        return (
                          _f.id ===
                          this.result_formula.types[this.result_formula.type]
                            .formula
                        );
                      })
                      .get_result(
                        comp_id,
                        _race.id,
                        this.stuff.judges.map(_j => {
                          return +_j.id;
                        })
                      )
                  );
                });
                return res.length > 0 ? Math.max(...res) : 0;
              }
            },
            {
              id: 1,
              title: "Сумма",
              result: comp_id => {
                let res = [];
                this.races.forEach(_race => {
                  res.push(
                    this.result_formula.types[this.result_formula.type].formulas
                      .find(_f => {
                        return (
                          _f.id ===
                          this.result_formula.types[this.result_formula.type]
                            .formula
                        );
                      })
                      .get_result(
                        comp_id,
                        _race.id,
                        this.stuff.judges.map(_j => {
                          return +_j.id;
                        })
                      )
                  );
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
                        ? (res = res.filter(_res => {
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
              }
            },
            {
              id: 2,
              title: "Среднее",
              result: comp_id => {
                let res = [];
                this.races.forEach(_race => {
                  res.push(
                    this.result_formula.types[this.result_formula.type].formulas
                      .find(_f => {
                        return (
                          _f.id ===
                          this.result_formula.types[this.result_formula.type]
                            .formula
                        );
                      })
                      .get_result(
                        comp_id,
                        _race.id,
                        this.stuff.judges.map(_j => {
                          return +_j.id;
                        })
                      )
                  );
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
                        ? (res = res.filter(_res => {
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
              }
            },
            {
              id: 3,
              title: "ABC"
            }
          ]
        },
        type: 0,
        types: [
          {
            id: 0,
            title: "По судьям",
            lower_marks: 0,
            higher_marks: 0,
            formula: 0,
            formulas: [
              {
                id: 0,
                title: "Среднее",
                get_result: (comp_id, race_id, judges) => {
                  let marks = [];
                  judges.forEach(_j => {
                    this.competitorsSheet.competitors.find(_comp => {
                      return _comp.id === comp_id;
                    })
                      ? marks.push(
                          ...this.competitorsSheet.competitors
                            .find(_comp => {
                              return _comp.id === comp_id;
                            })
                            .marks.filter(_mark => {
                              return (
                                +_mark.judge === +_j &&
                                _mark.race_id === race_id
                              );
                            })
                            .map(_mark => {
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
                    _marks = _marks.filter(_mark => {
                      return _mark !== Math.max(..._marks);
                    });
                  }
                  for (
                    let low = 0;
                    low < +this.result_formula.types[0].lower_marks;
                    low++
                  ) {
                    _marks = _marks.filter(_mark => {
                      return _mark !== Math.min(..._marks);
                    });
                  }
                  return (
                    (+this.result_formula.types[0].lower_marks +
                      +this.result_formula.types[0].higher_marks <
                      marks.length &&
                      _marks.reduce((a, b) => {
                        return +a + +b;
                      }) / _marks.length) ||
                    0
                  );
                }
              },
              {
                id: 1,
                title: "Сумма",
                get_result: (comp_id, race_id, judges) => {
                  let marks = [];
                  judges.forEach(_j => {
                    marks.push(
                      ...this.competitorsSheet.competitors
                        .find(_comp => {
                          return _comp.id === comp_id;
                        })
                        .marks.filter(_mark => {
                          return (
                            +_mark.judge === +_j && _mark.race_id === race_id
                          );
                        })
                        .map(_mark => {
                          return +_mark.value;
                        })
                    );
                  });
                  for (
                    let high = 0;
                    high < +this.result_formula.types[0].higher_marks;
                    high++
                  ) {
                    marks = marks.filter(_mark => {
                      return _mark !== Math.max(...marks);
                    });
                  }
                  for (
                    let low = 0;
                    low < +this.result_formula.types[0].lower_marks;
                    low++
                  ) {
                    marks = marks.filter(_mark => {
                      return _mark !== Math.min(...marks);
                    });
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
                }
              }
            ]
          },
          {
            id: 1,
            title: "По секциям",
            sections: [],
            formula: 0,
            formulas: [
              {
                id: 0,
                get_result: (comp_id, race_id) => {
                  let s_results = [];
                  this.result_formula.types[1].sections.forEach(_section => {
                    let section = [];
                    _section.judges.forEach(_judge => {
                      section.push(
                        (this.competitorsSheet.competitors
                          .find(_comp => {
                            return _comp.id === comp_id;
                          })
                          .marks.find(_mark => {
                            return (
                              _mark.race_id === race_id &&
                              _mark.judge === _judge.id
                            );
                          }) &&
                          this.competitorsSheet.competitors
                            .find(_comp => {
                              return _comp.id === comp_id;
                            })
                            .marks.find(_mark => {
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
                }
              }
            ]
          }
        ]
      };
    },
    RaceClass: class {
      constructor(title, type, discipline, competitors) {
        this.id = Math.random()
          .toString(36)
          .substr(2, 9);
        this.title = title || "Заезд";
        this.type = type;
        this.discipline = discipline;
        this.startList = competitors || [];
        this._startList = competitors || [];
        this.selectedCompetitor = competitors[0] || null;
      }
      del_dialog = false;
      finished = [];
      onTrack = null;
    }
  },
  getters: {
    EventClass: state => {
      return state.EventClass;
    },
    RaceClass: state => state.RaceClass
  },

  mutations: {},

  actions: {}
};
