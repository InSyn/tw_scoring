export default {
  namespaced: true,
  state: {
    EventClass: class {
      weather = [];
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
    }
  },

  getters: {
    EventClass: state => {
      return state.EventClass;
    }
  },

  mutations: {},

  actions: {}
};
