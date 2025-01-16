export const athleteHandlers = {
  'athlete:startPlace': (dataCtx) => {
    if (!dataCtx.competition && !dataCtx.competition.startList) return ['N/A'];
    return [dataCtx.startList.indexOf(dataCtx.competitor.id) + 1];
  },
  'athlete:info': (dataCtx, { id }) => {
    return [dataCtx.competitor.info_data[id]];
  },
  'athlete:rank': (dataCtx) => {
    return dataCtx.competitor.result ? [dataCtx.competitor.rank] : ['N/A'];
  },
  'judge:score': (dataCtx, { judgeId }) => {
    const marks = dataCtx.competitor.marks.filter((mark) => mark.judge === judgeId);
    return marks.length > 0 ? marks.map((mark) => mark.value) : '-';
  },
};
