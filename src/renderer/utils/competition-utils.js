export const getCompetitorById = (competition, competitorId) => {
  if (!competition || !competitorId) return null;

  let competitor = competition.competitorsSheet.competitors.find((competitor) => competitor.id.toString() === competitorId.toString());
  if (!competitor) competitor = competition.competitorsSheet.competitors.find((competitor) => competitor.info_data.bib.toString() === competitorId.toString());

  if (!competitor) return null;

  return competitor;
};

export const heatColors = ['red', 'green', 'blue', 'yellow'];
export const getHeatCompetitorColor = (startOrder) => {
  return heatColors[startOrder - 1] ? `--athlete-${heatColors[startOrder - 1]}` : 'transparent';
};

export const getDMCompetitorColor = (startOrder, totalStages, currentStage) => {
  const isFinalStage = currentStage === totalStages - 1 || currentStage === totalStages - 2;
  const isOddStage = currentStage % 2 === 0;

  return isFinalStage || isOddStage ? ['--athlete-red', '--athlete-blue'][startOrder] : ['--athlete-red', '--athlete-blue'][startOrder];
};

export const sortSXHeat = (heatCompetitors) => {
  const heatStatuses = {
    DNF: 101,
    DNS: 102,
    DSQ: 103,
    RAL: 100,
  };

  return heatCompetitors.sort((a, b) => {
    const aResultWeight = !isNaN(a.result) ? Number(a.result) : heatStatuses[a.result] || 999;
    const bResultWeight = !isNaN(b.result) ? Number(b.result) : heatStatuses[b.result] || 999;
    return aResultWeight - bResultWeight;
  });
};
