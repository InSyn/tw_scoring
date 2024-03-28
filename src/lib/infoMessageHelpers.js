export const stringifyInfoMsg = (competition, msg) => {
  const competitor = competition.competitorsSheet.competitors.find(
    (comp) => comp.id === msg.competitor
  );
  const judge = competition.stuff.judges.find(
    (judge) => judge._id === msg.judge
  );
  const race = competition.races.find((race) => race.id === msg.race);

  if (!competitor || !race || !judge) return;

  const msgPrefix = `${competitor.info_data["bib"]} ${race.title}: ${judge.title} ->`;

  const markType = (() => {
    for (const [key, value] of Object.entries(msg.mark.moguls_value)) {
      if (!!value) return "moguls";
    }
    for (const [key, value] of Object.entries(msg.mark.value_ae)) {
      if (!!value) return "aerials";
    }
    return "classic";
  })();

  switch (msg.type) {
    case "new_mark": {
      if (markType === "moguls") return `${msgPrefix} mg_dev`;

      if (markType === "aerials")
        return `${msgPrefix} AIR: ${msg.mark.value_ae.air} | FORM: ${msg.mark.value_ae.form} | LAND: ${msg.mark.value_ae.landing}`;

      return `${msgPrefix} ${msg.mark.value}`;
    }

    case "mark_overwrite": {
      if (markType === "moguls") return `${msgPrefix} mg_dev -> mg_dev`;

      if (markType === "aerials")
        return `${msgPrefix} 
        AIR: ${msg.old_mark.value_ae.air}->${msg.mark.value_ae.air} | 
        FORM: ${msg.old_mark.value_ae.form}->${msg.mark.value_ae.form} | 
        LAND: ${msg.old_mark.value_ae.landing}->${msg.mark.value_ae.landing}`;

      return `${msgPrefix} ${msg.old_mark.value} -> ${msg.mark.value}`;
    }

    default:
      return "unrecognized message type";
  }
};
