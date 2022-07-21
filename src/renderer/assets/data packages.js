export default [
  //  Софт -> Терминал (Судья)
  {
    msg_type: "set_competitor_on_start",
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
    msg_type: "score_approved",
    data: {
      race_id: "",
      competitor_id: "",
    },
  },
  {
    msg_type: "sync_time",
    data: {
      time: "10:00",
    },
  },

  //  Терминал (Судья) -> Софт
  {
    msg_type: "score_changed",
    data: {
      terminal_id: "",
      race_id: "",
      competitor_id: "",
      judge_id: "",
      scores: [0],
    },
  },
  {
    msg_type: "sync_time",
    data: {
      terminal_id: "",
    },
  },

  //    Софт -> Терминал (Ст. судья)
  {
    msg_type: "init_competition_races",
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
    msg_type: "get_competitor_results_by_race",
    data: {
      race_id: "",
      race_num: 0,
      competitor_id: "",
      results: [{ judge_num: "", result: 0 }],
    },
  },

  //    Терминал (Ст. судья) -> Софт
  {
    msg_type: "score_approve",
    data: {
      terminal_id: "",
      race_id: "",
      competitor_id: "",
    },
  },
  {
    msg_type: "get_results_by_race",
    data: {
      terminal_id: "",
      race_id: "",
      competitor_id: "",
    },
  },
];
