import { getDisciplineCode, getDisciplineFFRCode } from '../data/sports';

export const eventHandlers = {
  'event:title': (dataCtx) => {
    return [dataCtx.event_title || ''];
  },
  'event:sport': (dataCtx) => {
    return [dataCtx.sport || ''];
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
};
