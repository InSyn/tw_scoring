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
      constructor(header, width, align) {
        this.params.cells[0].id = header.id;
        this.params.cells[0].title = header.title;
        this.params.width = width || 10;
        this.params.align = align || { title: "Слева", value: "start" };
      }
      params = {
        cells: [
          { id: null, title: null },
          { id: null, title: null }
        ],
        width: null,
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
