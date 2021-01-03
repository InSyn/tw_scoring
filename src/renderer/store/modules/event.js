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
          { id: 1, title: "Фристайл", disciplines: [0, 1, 2, 3, 4, 5, 100] },
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
      sponsors = [];
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
        this.title = title || "Заезд";
        this.type = type;
        this.discipline = discipline;
        this.startList = competitors || [];
        this.onStart = this.startList || [];
      }
      finished = [];
      onTrack = null;
      selectedCompetitor = null;
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
