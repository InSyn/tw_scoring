import store from '../store';

export const getListDataSources = () => {
  const dataCtx = store.getters['main/getDataCtx'];
  if (!dataCtx) {
    console.warn('No competition found in the store.');
    return {};
  }

  const dataSources = {};

  dataSources['judges'] = {
    label: 'Судьи',
    data: dataCtx.stuff.judges || [],
    handlers: { ...generateJudgesListHandlers(dataCtx) },
  };
  dataSources['jury'] = {
    label: 'Жюри',
    data: dataCtx.stuff.judges || [],
    handlers: { ...generateJuryListHandlers(dataCtx) },
  };
  dataSources['forerunners'] = {
    label: 'Открывающие',
    data: dataCtx.stuff.openers || [],
    handlers: { ...generateForerunnersListHandlers(dataCtx) },
  };
  dataSources['tech-parameters'] = {
    label: 'Тех. параметры',
    data: dataCtx.technicalInfo.records || [],
    handlers: { ...generateTechnicalInfoListHandlers(dataCtx) },
  };
  dataSources['weather'] = {
    label: 'Погода',
    data: dataCtx.weather || [],
    handlers: { ...generateWeatherListHandlers(dataCtx) },
  };

  return dataSources;
};

const generateJudgesListHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found in the store.');
    return {};
  }
  const handlers = {};

  dataCtx.stuff.judges.forEach((judge, idx) => {
    ['title', 'name', 'ffr_id', 'location', 'category'].forEach((header) => {
      handlers[`judge${idx + 1}:${header}`] = () => {
        if (!judge || !judge[header]) return ['&nbsp;'];
        if (header === 'name') return [[judge.lastName, judge.name].join('&nbsp;')];

        return [judge[header] || '-'];
      };
    });
  });

  return handlers;
};

const generateJuryListHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found in the store.');
    return {};
  }
  const handlers = {};

  dataCtx.stuff.jury.forEach((jury, idx) => {
    ['title', 'name', 'ffr_id', 'location', 'category'].forEach((header) => {
      handlers[`jury${idx + 1}:${header}`] = () => {
        if (!jury || !jury[header]) return ['&nbsp;'];
        if (header === 'name') return [[jury.lastName, jury.name].join('&nbsp;')];

        return [jury[header] || '-'];
      };
    });
  });

  return handlers;
};

const generateTechnicalInfoListHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found in the store.');
    return {};
  }
  const handlers = {};

  dataCtx.technicalInfo.records.forEach((techInfo, idx) => {
    ['title', 'value'].forEach((header) => {
      handlers[`tech-info${idx + 1}:${header}`] = () => {
        if (!techInfo || !techInfo[header]) return ['&nbsp;'];
        return [techInfo[header] || '-'];
      };
    });
  });

  return handlers;
};

const generateWeatherListHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found in the store.');
    return {};
  }
  const handlers = {};

  dataCtx.weather.forEach((weather, idx) => {
    ['title', 'value'].forEach((header, headerIdx) => {
      handlers[`weather${idx + 1}:${header}`] = () => {
        if (!weather || !weather[`descr${headerIdx + 1}`]) return ['&nbsp;'];
        return [weather[`descr${headerIdx + 1}`] || '-'];
      };
    });
  });

  return handlers;
};
const generateForerunnersListHandlers = (dataCtx) => {
  if (!dataCtx) {
    console.warn('No competition found in the store.');
    return {};
  }
  const handlers = {};

  dataCtx.stuff.openers.forEach((forerunner, idx) => {
    ['bib', 'name', 'location'].forEach((header) => {
      handlers[`forerunner${idx + 1}:${header}`] = () => {
        if (!forerunner || !forerunner[header]) return ['&nbsp;'];
        if (header === 'name') return [[forerunner.lastName, forerunner.name].join('&nbsp;')];

        return [forerunner[header] || '-'];
      };
    });
  });

  return handlers;
};
