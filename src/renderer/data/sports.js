export const sports = [
  {
    code: 'FS',
    name: 'Freestyle',
    name_rus: 'Фристайл',
    disciplines: [
      { code: 'MO', name_rus: 'Могул' },
      { code: 'DM', name_rus: 'Парный могул' },
      { code: 'AE', name_rus: 'Акробатика' },
      { code: 'AET', name_rus: 'АКРОБАТИКА - ГРУППА - СМЕШАННАЯ' },
      { code: 'AES', name_rus: 'Синхронная Акробатика' },
      { code: 'SX', name_rus: 'Ски-кросс' },
      { code: 'SXT', name_rus: 'Командный ски-кросс' },
      { code: 'HP', name_rus: 'Хаф-пайп' },
      { code: 'SS', name_rus: 'Слоуп-стайл' },
      { code: 'BA', name_rus: 'Биг-эйр' },
      { code: 'RE', name_rus: 'Рэйл' },
    ],
  },
  {
    code: 'SB',
    name: 'Snowboard',
    name_rus: 'Сноуборд',
    disciplines: [
      { code: 'HP', name_rus: 'Хаф-пайп' },
      { code: 'SS', name_rus: 'Слоуп-стайл' },
      { code: 'BA', name_rus: 'Биг-эйр' },
      { code: 'RE', name_rus: 'Рэйл' },
      { code: 'PSL', name_rus: 'Параллельный слалом' },
      { code: 'PGS', name_rus: 'Параллельный слалом гигант' },
      { code: 'PRT', name_rus: 'Командный параллельный слалом' },
      { code: 'GS', name_rus: 'Слалом гигант' },
      { code: 'SL', name_rus: 'Слалом' },
      { code: 'SBX', name_rus: 'Сноуборд-кросс' },
      { code: 'BXT', name_rus: 'Командный сноуборд-кросс' },
    ],
  },
];

export const getSportDisciplines = (sportName) => {
  if (!sportName) return [];
  const sport = sports.find((sport) => {
    return sport.name_rus.toLowerCase() === sportName.toString().toLowerCase();
  });
  if (!sport) return [];

  return sport.disciplines;
};

export const getDisciplineCode = (discipline) => {
  if (!discipline) return '';

  const sport = sports.find((spt) => spt.disciplines.some((dsc) => dsc.name_rus.toLowerCase() === discipline.toLowerCase()));
  if (!sport) return '';

  const dscCode = sport.disciplines.find((dsc) => dsc.name_rus.toLowerCase() === discipline.toLowerCase()).code;
  if (!dscCode) return '';

  return dscCode;
};

export const checkCompetitionDiscipline = (competition, dscCodesArr) => {
  if (!competition || !dscCodesArr || !dscCodesArr.length) return false;

  return dscCodesArr.some((dscCode) => getDisciplineCode(competition.mainData.discipline.value) === dscCode);
};

export const isQualification = (competition) => {
  if (!competition) return false;
  return competition.mainData.title.stage.value.value === 'Квалификация';
};
export const isQualificationOfDisciplines = (competition, dscCodes) => {
  return isQualification(competition) && checkCompetitionDiscipline(competition, dscCodes);
};

export const isFinal = (competition) => {
  if (!competition) return false;
  return competition.mainData.title.stage.value.value === 'Финал';
};
export const isFinalOfDisciplines = (competition, dscCodes) => {
  return isFinal(competition) && checkCompetitionDiscipline(competition, dscCodes);
};

export const isSXQualification = (competition) => {
  if (!competition) return false;
  const competitionDiscipline = getDisciplineCode(competition.mainData.discipline.value);
  if (!competitionDiscipline) return false;

  return ['SX', 'SXT'].includes(competitionDiscipline) && competition.mainData.title.stage.value.value.toString().split(' ')[0] === 'Квалификация';
};

export const getDisciplineFFRCode = (disciplineCode) => {
  if (!disciplineCode) return '';

  const FFRCodes = {
    SS: '0510063611Я',
    BA: '0510073611Я',
    HP: '0510053611Я',
    MO: '0510023611Я',
    DM: '0510033611Я',
    AE: '0510013611Я',
    AET: '0510083611Я',
    SX: '0510043611Я',
  };

  return FFRCodes[disciplineCode];
};

export const defaultPointsSheet = {
  1: '100',
  2: '80',
  3: '60',
  4: '50',
  5: '45',
  6: '40',
  7: '36',
  8: '32',
  9: '29',
  10: '26',
  11: '24',
  12: '22',
  13: '20',
  14: '18',
  15: '16',
  16: '15',
  17: '14',
  18: '13',
  19: '12',
  20: '11',
  21: '10',
  22: '9',
  23: '8',
  24: '7',
  25: '6',
  26: '5',
  27: '4',
  28: '3',
  29: '2',
  30: '1',
};
