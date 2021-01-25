export default {
  namespaced: true,
  state: {
    EventClass: class {
      constructor() {
        this.structure.selected.type = 0;
        this.structure.selected.discipline = 0;
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
          { id: 0, title: "1", value: 1 },
          { id: 1, title: "1/10", value: 10 },
          { id: 2, title: "1/100", value: 1000 },
          { id: 3, title: "1/1000", value: 10000 }
        ]
      };
      races = [];
      selected_race_id = 0;
      get selected_race() {
        return this.races[this.selected_race_id];
      }
      mainData = {
        title: {
          title: "Название",
          value: "Новое соревнование",
          focus: false
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
            name: "",
            surName: "",
            loc: "",
            connected: false
          }
        ],
        judges: [],
        openers: []
      };
      technicalInfo = [
        {
          title: "",
          value: ""
        }
      ];
      competitorsSheet = {
        header: [
          { id: "bib", title: "Bib" },
          { id: "name", title: "Имя" },
          { id: "surname", title: "Фамилия" },
          { id: "gender", title: "Пол" },
          { id: "year", title: "Год" }
        ],
        competitors: []
      };
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
      result_formula = {
        type: 0,
        types: [
          {
            id: 0,
            title: "По судьям",
            lower_marks: 0,
            higher_marks: 0,
            formula: 0,
            formulas: [
              { id: 0, title: "Среднее" },
              { id: 1, title: "Сумма" }
            ],
            get_result: (judges, race_id, competitor_id) => {
              let competitor = this.competitorsSheet.competitors.find(_comp => {
                return _comp.id === competitor_id;
              });
              let marks = judges.forEach(_judge => {
                competitor.marks.filter(_mark => {
                  return _mark.race === race_id && _mark.judge === _judge._id;
                });
              });
              console.log(marks);
              return marks;
            }
          },
          {
            id: 1,
            title: "По секциям",
            sections: [],
            get_result(judges, race, competitor) {
              let marks = [];
              for (let judge in judges) {
                marks.push(judges[judge] || 0);
              }
              console.log(marks);
              return marks;
            }
          }
        ],
        get_race_result: data => {
          let marks = (data.length > 0 && data) || [0, 0];
          let sections_res = [];
          let race_res = 0;
          let _marks = marks.map(mark => {
            return +mark.value;
          });
          race_res =
            _marks.reduce((acc, cur) => {
              return acc + cur;
            }) / (_marks.length > 0 && _marks.length) || 0;
          return race_res;
        },
        get_result: marks => {
          return marks.reduce((acc, cur) => {
            return acc + cur;
          });
        }
      };
      protocolSettings = {
        sponsors: [],
        protocol_headers: [],
        title: "",
        print_header: true,
        strings_at_page: 12,
        font_size: 16,
        notations: "",
        signs: {
          left: {
            text: "",
            img: ""
          },
          center: {
            text: "",
            img: ""
          },
          right: {
            text: "",
            img: ""
          }
        },
        use_grid: false,
        use_string_light: true,
        string_lights: {
          odd: "#A2A2A2",
          even: "#363636"
        }
      };
      timer = {
        sec: null,
        min: null,
        hrs: null,
        ticker: () => {
          const date = new Date();
          this.timer.sec = `${
            date.getSeconds().toString().length < 2
              ? "0" + date.getSeconds()
              : date.getSeconds()
          }`;
          this.timer.min = `${
            date.getMinutes().toString().length < 2
              ? "0" + date.getMinutes()
              : date.getMinutes()
          }`;
          this.timer.hrs = `${
            date.getHours().toString().length < 2
              ? "0" + date.getHours()
              : date.getHours()
          }`;
          setTimeout(() => {
            this.timer.ticker();
          }, 1000);
        }
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
