const getCompetitions = (competitions, options) => {
  return competitions.map((competition) => {
    return {
      competition_id: competition.id,
      title: competition.mainData.title.value,
      stage: competition.mainData.title.stage.value.value,
      competitors: getCompetitors(competition, options),
      races: getRaces(competition, options),
      total_results: getTotalResults(competition),
    };
  });
};

const getRaces = (competition, options) => {
  return competition.races.map((race) => {
    return {
      race_id: race.id,
      title: race.title,
      active_athlete: race.onTrack,
      start_list: race._startList,
      results: getRaceResults(race, competition),
    };
  });
};

const getRaceResults = (race, competition) => {
  const finishedCompetitors = race.finished.map((competitor_id) =>
    competition.competitorsSheet.competitors.find(
      (competitor) => competitor.id === competitor_id
    )
  );

  const raceResults = finishedCompetitors.map((competitor) => {
    const competitorRaceResult = competitor.results.find(
      (raceResult) => raceResult.race_id === race.id
    );
    if (!competitorRaceResult) return;

    let result = competitorRaceResult.status
      ? competitorRaceResult.status
      : competitorRaceResult.value;
    if (!competitorRaceResult.status && competitorRaceResult.repeat)
      result = result + " " + competitorRaceResult.repeat;

    const marks = competitor.marks
      .filter((mark) => mark.race_id === race.id)
      .map((mark) => {
        return { judge_id: mark.judge, value: mark.value };
      });

    return {
      race_id: competitorRaceResult.race_id,
      competitor_id: competitor.id,
      marks: marks,
      value: result,
      trick_name: result.ae_code || "",
    };
  });

  return raceResults.sort((result_1, result_2) => {
    const statuses = {
      DNF: -1,
      DNS: -2,
      DSQ: -3,
    };
    const result_1_value = statuses[result_1.value]
        ? statuses[result_1.value]
        : Number(result_1.value) || 0,
      result_2_value = statuses[result_2.value]
        ? statuses[result_2.value]
        : Number(result_2.value) || 0;

    return result_2_value - result_1_value;
  });
};

const getTotalResults = (competition) => {
  const totalResults = competition.competitorsSheet.competitors.map(
    (competitor) => {
      const totalResult = competitor.results_overall.find(
        (result) => result.competition_id === competition.id
      );
      if (!totalResult) return;

      return {
        competition_id: competition.id,
        competitor_id: competitor.id,
        value: totalResult.status ? totalResult.status : totalResult.value,
      };
    }
  );

  const sortedResults = totalResults
    .sort((result_1, result_2) => {
      const statuses = {
        DNF: -1,
        DNS: -2,
        DSQ: -3,
      };

      return (
        (statuses.hasOwnProperty(result_2.value)
          ? statuses[result_2.value]
          : Number(result_2.value)) -
        (statuses.hasOwnProperty(result_1.value)
          ? statuses[result_1.value]
          : Number(result_1.value))
      );
    })
    .map((result, index) => {
      return { ...result, rank: index + 1 };
    });

  return sortedResults;
};

const getCompetitors = (competition, options) => {
  let competitors;

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
      .map((team) => {
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
        };
      });
  } else {
    competitors = competition.competitorsSheet.competitors.map((competitor) => {
      return {
        local_id: competitor.id,
        bib: competitor.info_data["bib"],
        name: competitor.info_data["name"],
        lastname: competitor.info_data["lastname"],
        rus_code: competitor.info_data["rus_code"],
        fis_code: competitor.info_data["fis_code"],
        birth_date: competitor.info_data["birth_date"],
        country: competitor.info_data["country"],
        country_code: competitor.info_data["country_code"],
        region: competitor.info_data["region"],
        region_code: competitor.info_data["region_code"],
        organization: competitor.info_data["organization"],
        category: competitor.info_data["category"],
      };
    });
  }

  return competitors;
};

export const generateLiveEvent = ({ event, competitions }, options) => {
  let live_event = {
    event_id: event.live_id,
    competitions: getCompetitions(competitions, options),
  };

  if (options.initialize) {
    if (!competitions.length) return live_event;

    const juryList = competitions[0].stuff.jury.map((jury) => {
      return {
        jury_code: jury.jury_code || "",
        role: jury.title,
        name: jury.name,
        lastname: jury.lastName,
        category: jury.category,
      };
    });
    const judgesList = competitions[0].stuff.judges.map((judge) => {
      return {
        jury_code: judge.jury_code || "",
        role: judge.title,
        name: judge.name,
        lastname: judge.lastName,
        category: judge.category,
      };
    });

    const forerunners = competitions[0].stuff.openers.map((forerunner) => {
      return {
        number: forerunner.bib,
        name: `${forerunner.lastName} ${forerunner.name}`,
        region_code: forerunner.location,
      };
    });

    const track_info = competitions[0].technicalInfo.records.map(
      (item) => `${item.title}::${item.value}`
    );
    const conditions = competitions[0].weather.map(
      (item) => `${item.descr1}::${item.descr2}`
    );

    live_event = {
      ...live_event,
      jury: [...juryList, ...judgesList],
      forerunners,
      track_info,
      conditions,
    };
  }

  return live_event;
};
