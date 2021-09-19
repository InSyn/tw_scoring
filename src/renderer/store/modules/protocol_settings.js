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
      print_header: false,
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
      use_grid: false,
      use_string_light: false,
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
      constructor(header, width, font, align, handler) {
        this.params.cells[0].id = header.id;
        this.params.cells[0].title = header.title;
        this.params.width = width || 10;
        this.params.font = font || 12;
        this.params.align = align || { title: "Слева", value: "start" };
        this.handler = handler;
      }
      params = {
        cells: [
          { id: null, title: null },
          { id: null, title: null }
        ],
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
