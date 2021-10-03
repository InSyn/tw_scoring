export default {
  namespaced: true,
  state: {
    results_protocol: {
      standard_aligns: [
        { title: "Слева", value: "start" },
        { title: "Центр", value: "center" },
        { title: "Справа", value: "end" }
      ],
      protocol_fields: [],
      title: "",
      use_grid: false,
      use_string_light: true,
      print_header: true,
      strings_at_page: 6,
      font_size: 12,
      notations:
        "<b>Данные о погоде</b>:<br><b>Квалификация</b>: Ясно &nbsp<b>Температура снега</b>: -1°C / 30°F &nbsp<b>Температура воздуха</b>: -2°C / 28°F<br><b>Финал</b>: Ясно &nbsp<b>Температура снега</b>: -3°C / 26°F &nbsp<b>Температура воздуха</b>: -5°C / 22°F",
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
      string_lights: {
        odd: "#FFFFFF",
        even: "#AAAAAA"
      },
      layout: {
        height: 297,
        width: 210,
        padding: [5, 5],
        orientation: "portrait",
        pdf_scale: 1
      },
      assets: {
        header_logo: {
          file: null,
          title: "Изображение для «шапки»"
        },
        footer_logo: {
          file: null,
          title: "Изображение для «подвала»"
        },
        title_logo: {
          file: null,
          title: "Логотип"
        }
      }
    },
    start_list: {},
    fieldClass: class {
      constructor(width, font, align, cell_1, cell_2) {
        this.id = Math.random()
          .toString(36)
          .substr(2, 9);
        this.select_dialog = false;
        this.params.width = width || 10;
        this.params.font = font || 12;
        this.params.align = align || { title: "Слева", value: "start" };

        this.params.cell_1.id = cell_1.data.id;
        this.params.cell_1.title = cell_1.data.title;
        this.params.cell_1.handler = cell_1.handler;

        this.params.cell_2.id =
          (cell_2 && cell_2.data && cell_2.data.id) || null;
        this.params.cell_2.title =
          (cell_2 && cell_2.data && cell_2.data.title) || null;
        this.params.cell_2.handler =
          (cell_2 && cell_2.handler && cell_2.handler) ||
          function() {
            return 0;
          };
      }
      params = {
        cell_1: {
          id: null,
          title: null,
          handler: function() {
            return 0;
          }
        },
        cell_2: {
          id: null,
          title: null,
          handler: function() {
            return 0;
          }
        },
        width: null,
        font: null,
        align: null
      };
    }
  },
  getters: {
    results_protocol: state => state.results_protocol,
    testResults: state => state.testResults,
    fieldClass: state => state.fieldClass
  },
  mutations: {
    setImage: (state, data) => {
      console.log(data);
      state.results_protocol.assets[data[0]].file = data[1].target.files[0];
    }
  }
};
