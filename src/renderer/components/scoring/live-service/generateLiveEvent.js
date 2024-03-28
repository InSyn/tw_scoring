const getCompetitions = (competitions, options) => {
  return competitions.map((competition) => {
    return {
      ID: competition.id,
      title: competition.mainData.title.value,
      stage: competition.mainData.title.stage.value.value,
      races: getRaces(competition, options),
    };
  });
};
const getRaces = (competition, options) => {
  return competition.races.map((race) => {
    return {
      title: race.title,
      onTrack: [race.onTrack].map((onTrack) => {
        const competitor = competition.competitorsSheet.competitors.find(
          (_comp) => _comp.id === onTrack
        );
        return competitor
          ? {
              bib: competitor.info_data["bib"],
              name: competitor.info_data["name"],
              lastname: competitor.info_data["lastname"],
              marks: competitor.marks
                .filter((mark) => mark.race_id === race.id)
                .map((mark) => {
                  return {
                    value: mark.value,
                    judge: mark.judge,
                    race_id: mark.race_id,
                  };
                }),
            }
          : null;
      }),
      competitors: getCompetitors(competition, race, options),
    };
  });
};
const getCompetitors = (competition, race, options) => {
  let competitors = [];
  if (options.is_teams) {
    competitors = competition.teams
      .map((team) => {
        const teamResult = competition.getTeamRaceResult(
          team,
          competition.selected_race
        );

        if (teamResult)
          return {
            ...team,
            teamResult,
          };
        return team;
      })
      .sort(
        (team1_res, team2_res) => +team2_res.teamResult - +team1_res.teamResult
      )
      .map((team, idx) => {
        const teamCompetitorsString = team.competitors
          .map((competitorId) => {
            const competitor = competition.competitorsSheet.competitors.find(
              (competitor) => competitor.id === competitorId
            );
            return competitor.info_data["lastname"] || "";
          })
          .join(" | ");

        return {
          bib: team.id,
          name: teamCompetitorsString,
          lastname: team.name,
          results: competition.races.map((race) => {
            return {
              competition: competition.id,
              race: race.id,
              value: competition.getTeamRaceResult(team, race),
            };
          }),
          marks: [],
          overall_results: competition.races.map((race) => {
            return {
              competition: competition.id,
              value: competition.getTeamRaceResult(team, race),
            };
          }),
        };
      });
  } else {
    competitors = race._startList.map((_competitor) => {
      const competitor = competition.competitorsSheet.competitors.find(
        (_comp) => _comp.id === _competitor
      );
      return {
        bib: competitor.info_data["bib"],
        name: competitor.info_data["name"],
        lastname: competitor.info_data["lastname"],
        results: competitor.results
          .filter((result) => result.race_id === race.id)
          .map((result) => {
            return {
              race: result.race_id,
              value: `${result.value}${
                result.repeat ? " " + result.repeat : ""
              }`,
              status: result.status,
            };
          }),
        marks: competitor.marks
          .filter((mark) => mark.race_id === race.id)
          .map((mark) => {
            return {
              value: mark.value,
              judge: mark.judge,
              race_id: mark.race_id,
            };
          }),
        overall_results: competitor.results_overall
          .filter((overall) => overall.competition_id === competition.id)
          .map((overall) => {
            return {
              competition: overall.competition_id,
              value: overall.value,
              status: overall.status,
            };
          }),
      };
    });
  }

  return competitors;
};

export const generateLiveEvent = (
  { event, competitions, event_id },
  options
) => {
  const live_event = {
    event_id: event_id,
    title: event.event_title,
    sport: event.sport,
    discipline: competitions[0].mainData.discipline.value,
    created_at: new Date(
      `${competitions[0].mainData.date.value}:${competitions[0].mainData.date.time}`
    ).toUTCString(),
    start_at: new Date(
      `${competitions[0].mainData.date.value}:${competitions[0].mainData.date.time}`
    ).toUTCString(),
    location: competitions[0].mainData.location.value,
    organization: competitions[0].mainData.provider.value,
    timing_provider: competitions[0].mainData.providerTiming.value,
    description: "",
    competitions: getCompetitions(competitions, options),
  };

  return live_event;
};
