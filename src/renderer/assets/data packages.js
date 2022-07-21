export default [
  //  Софт -> Терминал (Судья)
  {
    event: "set_competitor_on_start",
    data: {
      race_id: "",
      competitor_id: "",
      num: 0,
      name: "",
      scoring_setup: {
        scores: 1,
        isABC: false,
      },
    },
  },
  {
    event: "score_approved",
    data: {
      race_id: "",
      competitor_id: "",
    },
  },
  {
    event: "",
  },

  //  Терминал (Судья) -> Софт
  {
    event: "score_changed",
    data: {
      terminal_id: "",
      race_id: "",
      competitor_id: "",
      judge_id: "",
      scores: [0],
    },
  },

  //    Софт -> Терминал (Ст. судья)
  {
    event: "init_competition",
    data: {
      races: [
        {
          race_id: "",
          race_num: 0,
        },
      ],
    },
  },
  {
    event: "competitor_results_by_race",
    data: {
      race_id: "",
      race_num: 0,
      competitor_id: "",
      results: [{ judge_num: "", result: 0 }],
    },
  },

  //    Терминал (Ст. судья) -> Софт
  {
    event: "score_approve",
    data: {
      terminal_id: "",
      race_id: "",
      competitor_id: "",
    },
  },
  {
    event: "get_results_by_race",
    data: {
      terminal_id: "",
      race_id: "",
      competitor_id: "",
    },
  },
];
