const { Schema, model } = require("mongoose");

const EventSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  discipline: { type: String, required: true },
  date: { type: String, default: Date.now },
  country: { type: String, default: "" },
  region: { type: String, default: "" },
  codex: { type: String, default: "" },
  races: [
    {
      race_num: { type: Number, required: true },
      results: [
        {
          rank: { type: Number, required: true },
          bib: { type: Number, required: true },
          name: { type: String, required: true },
          surName: { type: String, required: true },
          nation: { type: String, default: "" },
          region: { type: String, default: "" },
          result: { type: String, default: "0" }
        }
      ]
    }
  ]
});

module.exports = model("Event", EventSchema);
