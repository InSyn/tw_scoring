let competition = {
  ae_codes: [],
  mainData: {
    title: {
      title: "Название",
      value: "Новое соревнование",
    },
    discipline: {
      title: "Дисциплина",
      value: "",
      min: "",
    },
    date: {
      title: "Дата проведения",
      value: "",
      time: "",
    },
    country: {
      title: "Страна",
      value: "",
    },
    location: {
      title: "Место проведения",
      value: "",
    },
    provider: {
      title: "Организатор",
      value: "",
    },
    providerTiming: {
      title: "Timing provider",
      value: "",
    },
    codex: {
      title: "Codex",
      value: "0000",
    },
  },
  result_formula: {
    overall_result: {
      type: 1,
      select_heats: {
        heats: 0,
        mode: 0,
        modes: [
          { id: 0, title: "Подсчёт из всех" },
          { id: 1, title: "Подсчёт из N лучших" },
        ],
      },
      types: [
        {
          id: 0,
          title: "Лучший",
        },
        {
          id: 1,
          title: "Сумма",
        },
        {
          id: 2,
          title: "Среднее",
        },
        {
          id: 3,
          title: "ABC",
        },
      ],
    },
    type: 0,
    types: [
      {
        id: 0,
        title: "По судьям",
        lower_marks: 0,
        higher_marks: 0,
        formula: 0,
      },
      {
        id: 1,
        title: "По секциям",
        sections: [],
        formula: 0,
      },
    ],
  },
  secretary: {
    name: "",
    surName: "",
    connected: "",
  },
  stuff: {
    jury: [
      {
        title: "Главный судья",
        name: "",
        surName: "",
        loc: "",
        connected: false,
        socket_id: null,
      },
    ],
    judges: [],
  },
  competitorsSheet: {
    header: [],
    competitors: [],
  },
  changed_marks: [],
  races: [],
  selected_race_id: 0,
};

export default competition;
