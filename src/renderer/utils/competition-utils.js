export const getCompetitorById = (competition, competitorId) => {
  if (!competition || !competitorId) return null;

  const competitor = competition.competitorsSheet.competitors.find((competitor) => competitor.id === competitorId);
  if (!competitor) return null;

  return competitor;
};

export const getCompetitorByBib = (competition, bib) => {
  if (!competition || !bib) return null;

  const competitor = competition.competitorsSheet.competitors.find((competitor) => competitor.info_data['bib'].toString() === bib.toString());
  if (!competitor) return null;

  return competitor;
};

export const getHeatCompetitorColor = (startOrder) => {
  switch (startOrder) {
    case 1:
      return '--athlete-red';
    case 2:
      return '--athlete-green';
    case 3:
      return '--athlete-blue';
    case 4:
      return '--athlete-yellow';

    default:
      return 'transparent';
  }
};
export const getDMCompetitorColor = (startOrder, totalStages, currentStage) => {
  const isFinalStage = currentStage === totalStages - 1 || currentStage === totalStages - 2;
  const isOddStage = currentStage % 2 === 0;

  return isFinalStage || isOddStage ? ['--athlete-red', '--athlete-blue'][startOrder] : ['--athlete-red', '--athlete-blue'][startOrder];
};
