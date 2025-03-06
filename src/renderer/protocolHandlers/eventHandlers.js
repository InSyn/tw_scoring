import { getDisciplineCode, getDisciplineFFRCode } from '../data/sports';

export const eventHandlers = {
  'event:title': (dataCtx) => {
    return [dataCtx.event_title || ''];
  },
  'event:sport': (dataCtx) => {
    return [dataCtx.sport || ''];
  },
  'event:number-of-competitors': (dataCtx) => {
    const usedCompetitions = dataCtx.stages.stage_grid.reduce((sum, stage) => [...sum, ...stage.s_competitions], []);
    const competitions = usedCompetitions.map((compId) => dataCtx.competitions.find((comp) => comp.id === compId));

    return [Math.max(...competitions.map((comp) => comp.competitorsSheet.competitors.length)) || ''];
  },
  'competition:discipline': ({ mainData }) => {
    if (!mainData) return [''];
    return [mainData.discipline.value || ''];
  },
  'competition:discipline-short': ({ mainData }) => {
    if (!mainData || !mainData.discipline.value) return [''];
    return [getDisciplineCode(mainData.discipline.value) || ''];
  },
  'competition:discipline-ffr-code': ({ mainData }) => {
    if (!mainData || !mainData.discipline.value) return [''];
    return [getDisciplineFFRCode(getDisciplineCode(mainData.discipline.value)) || ''];
  },
  'competition:stage': ({ mainData }) => {
    if (!mainData) return [''];
    if (!mainData.title || !mainData.title.stage || !mainData.title.stage.value) return [''];
    return [mainData.title.stage.value.value || ''];
  },
  'competition:group-ru': ({ mainData }) => {
    if (!mainData) return [''];
    const group_ru = {
      men: 'Мужчины',
      women: 'Женщины',
      mixed: 'Смешанные',
      juniors: 'Молодежные',
      seniors: 'Пожилые',
      youth: 'Молодежные',
    };
    return [group_ru[mainData.title.stage.group] || ''];
  },
  'competition:date': ({ mainData }) => {
    if (!mainData) return [''];
    return [mainData.date.value || ''];
  },
  'competition:time': ({ mainData }) => {
    if (!mainData) return [''];
    return [mainData.date.time || ''];
  },
  'competition:country': ({ mainData }) => {
    if (!mainData) return [''];
    return [mainData.country.value || ''];
  },
  'competition:location': ({ mainData }) => {
    if (!mainData) return [''];
    return [mainData.location.value || ''];
  },
  'competition:provider': ({ mainData }) => {
    if (!mainData) return [''];
    return [mainData.provider.value || ''];
  },
  'competition:dataService': ({ mainData }) => {
    if (!mainData) return [''];
    return [mainData.providerTiming.value || ''];
  },
  'competition:codex': ({ mainData }) => {
    if (!mainData) return [''];
    return [mainData.codex.value || ''];
  },
  'competition:number-of-competitors': (dataCtx) => {
    return [dataCtx.competitorsSheet.competitors.length || ''];
  },
};
