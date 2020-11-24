export default {
  namespaced: true,
  state: {
    EventClass: class {
      constructor() {
        this.structure.selected.type = this.structure.type[0];
        this.structure.selected.discipline = this.structure.type[0].disciplines[0];
        this.structure.selected.accuracy = this.structure.accuracy[2];
      }
      weather = [];
      structure = {
        selected: {
          type: "",
          discipline: "",
          accuracy: null
        },
        type: [
          {
            title: "Сноуборд",
            disciplines: [
              {
                title: "Слоуп-Стайл"
              },
              {
                title: "Биг-Эйр"
              },
              {
                title: "Хаф-Пайп"
              },
              {
                title: "Пользовательский"
              }
            ]
          },
          {
            title: "Фристайл",
            disciplines: [
              {
                title: "Слоуп-Стайл"
              },
              {
                title: "Биг-Эйр"
              },
              {
                title: "Хаф-Пайп"
              },
              {
                title: "Пользовательский"
              }
            ]
          },
          {
            title: "Пользовательский",
            disciplines: [
              {
                title: "Пользовательский"
              }
            ]
          }
        ],
        accuracy: ["1", "1/10", "1/100", "1/1000"]
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
        jury: [],
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
        header: [],
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
      constructor(title, type, discipline, competitors, onStart) {
        this.title = title || "Заезд";
        this.type = type;
        this.discipline = discipline;
        this.startList = competitors || [];
        this.onStart = onStart || [];
      }
      onStart = [];
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
