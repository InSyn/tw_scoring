import { roundNumber, truncateNumber } from './utils';

// MOGULS
export const calculateTurnsSum = ({ competition = null, competitor = null, result = null, scores = [] }) => {
  const turnsSum = scores.reduce((sum, mark) => {
    const calculatedScore = roundNumber(Number(mark.moguls_value.baseScore || 0) - Number(mark.moguls_value.deduction || 0), 1);
    const score = calculatedScore < 0.1 ? 0.1 : calculatedScore;

    return sum + score;
  }, 0);

  return turnsSum ? turnsSum.toFixed(1) : '-';
};

export const calculateJumpsSum = ({ competition = null, competitor = null, result = null, scores = [] }) => {
  const group = competitor.info_data['group'] || competition.mainData.title.stage.group || 'men';

  const jump1Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump1_code);
  const jump1_coef = jump1Code ? Number(jump1Code[`value_${group}`]) : 0;

  const jump2Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump2_code);
  const jump2_coef = jump2Code ? Number(jump2Code[`value_${group}`]) : 0;

  const jump1_scores = scores
    .map((mark) =>
      mark.moguls_value.jump1_score ? (mark.moguls_value.jump1_score * jump1_coef > 10 ? 10 : truncateNumber(mark.moguls_value.jump1_score * jump1_coef, 2)) : 0
    )
    .filter((mark) => !!mark);
  const jump2_scores = scores
    .map((mark) =>
      mark.moguls_value.jump2_score ? (mark.moguls_value.jump2_score * jump1_coef > 10 ? 10 : truncateNumber(mark.moguls_value.jump2_score * jump2_coef, 2)) : 0
    )
    .filter((mark) => !!mark);

  let judge1_jumpSum = jump1_scores.reduce((acc, val) => roundNumber(acc + Number(val), 2), 0);
  if (judge1_jumpSum >= 20) judge1_jumpSum = 20;

  let judge2_jumpSum = jump2_scores.reduce((acc, val) => roundNumber(acc + Number(val), 2), 0);
  if (judge2_jumpSum >= 20) judge2_jumpSum = 20;

  const jumpsSum = truncateNumber((judge1_jumpSum + judge2_jumpSum) / 2, 2);
  return isNaN(jumpsSum) ? '-' : jumpsSum.toFixed(2);
};

// DUAL MOGULS

// ADDITIONAL

export const generateScoresString = (discipline, { competition = null, competitor = null, result = null, scores = [] }) => {
  if (!discipline || !scores.length) return '-';
  const data = {
    competition,
    competitor,
    result,
    scores,
  };

  switch (discipline) {
    case 'MO': {
      if (!result || !result.mgRunParams) return;
      return `Время: ${result.mgRunParams.runTime || '0.0'}    Повороты: ${calculateTurnsSum(data)}    Прыжки: ${calculateJumpsSum(data)}`;
    }
    case 'DM': {
      return scores.map((score) => (score.value !== null && score.value !== undefined ? score.value.toString() : ' ')).join('  -  ');
    }
    default:
      return scores.map((score) => (score.value ? score.value.toString() : '-')).join(', ');
  }
};
