import { gridBlockStyles, competitionTopStyles } from './grid-styles';
import { isSXFinalGrid } from './grid-data';
import { getCompetitorById, getHeatCompetitorColor } from '../../../utils/competition-utils';
import { hasStatus } from '../../RaceClass';
import { getDMProgressionData } from '../../../protocolHandlers/tableHandlers';
import { isFinalOfDisciplines } from '../../../data/sports';
import { getSXFinalClassification } from '../../../utils/fileTranslation/SX';
import { renderBracketOverlaySvg } from './grid-layout';

export const renderGridStage = (dataCtx, { stage, index }, ctx) => {
  let runs = Array.isArray(stage.runs) ? stage.runs : [];

  let pageStartOffset = 0;

  if (ctx.pageSegments && typeof index === 'number') {
    const segment = ctx.pageSegments[index];

    if (segment && Array.isArray(stage.runs)) {
      const { start, end } = segment;
      runs = stage.runs.slice(start, end);
      pageStartOffset = typeof start === 'number' ? start : 0;
    } else {
      runs = [];
    }
  }

  const isEvenStage = (dataCtx.races.length - 1 - index) % 2 === 0 && index !== dataCtx.races.length - 1;
  const isSemiFinalStage = index === dataCtx.races.length - 2;
  const isFinalStage = index === dataCtx.races.length - 1;

  const stageComputedStyles = {
    ...gridBlockStyles.stage.stageStyles,
    marginLeft: `${index > 0 ? '2em' : '0'}`,
  };

  const hasPagedLayout = ctx._gridLayout && ctx._gridLayout.layoutMode === 'paged';
  const stageRunsComputedStyles = {
    ...gridBlockStyles.stage.stageRunsStyles,
    flex: hasPagedLayout ? '1 1 0' : gridBlockStyles.stage.stageRunsStyles.flex,
    height: hasPagedLayout ? '100%' : 'auto',
    justifyContent: isSemiFinalStage || isFinalStage ? 'center' : 'flex-start',
  };

  if (isEvenStage) stageComputedStyles.backgroundColor = 'var(--even-stage-color)';

  return `
    <div class="protocol-grid-stage" data-stage-index="${index}" style="${ctx.stylesToCSS(stageComputedStyles)}">
      <div class="protocol-grid-run-title" style="${ctx.stylesToCSS(gridBlockStyles.run.runTitleStyles)}">${stage.title}</div>
      <div class="protocol-grid-stage-runs" style="${ctx.stylesToCSS(stageRunsComputedStyles)}">
          ${runs
            .map((run, localIdx) =>
              renderGridRun(
                dataCtx,
                {
                  stage,
                  stageIndex: index,
                  globalRunIndex: pageStartOffset + localIdx,
                  isEvenStage,
                  isSemiFinalStage,
                  isFinalStage,
                  run,
                },
                ctx
              )
            )
            .join('')}
      </div>
    </div>
  `;
};

export const renderGridRun = (dataCtx, { stage, stageIndex, globalRunIndex, isEvenStage, isSemiFinalStage, isFinalStage, run }, ctx) => {
  if (!run.competitors || !run.competitors.length) return '<strong style="color: red">No competitors to render the run</strong>';

  const hasPagedLayout = ctx._gridLayout && ctx._gridLayout.layoutMode === 'paged';
  const extraPerRun = hasPagedLayout && ctx._gridLayout && typeof ctx._gridLayout.extraPerRun === 'number' ? ctx._gridLayout.extraPerRun : 0;

  const stageRunComputedStyles = {
    ...gridBlockStyles.run.stageRunStyles,
  };

  if (hasPagedLayout) {
    const gap = `${extraPerRun / 2}px`;
    stageRunComputedStyles.marginTop = isFinalStage || isSemiFinalStage ? gap : 'auto';
    stageRunComputedStyles.marginBottom = isFinalStage || isSemiFinalStage ? gap : 'auto';
    stageRunComputedStyles.transform = isSemiFinalStage ? 'translateY(8rem)' : isFinalStage ? 'translateY(-4rem)' : '';
  } else {
    stageRunComputedStyles.marginTop = isFinalStage ? '0' : 'auto';
    stageRunComputedStyles.marginBottom = isFinalStage ? '2rem' : 'auto';
  }

  const isSXGridRun = isSXFinalGrid(dataCtx, run);
  const runCompetitorsComputedStyles = {
    ...gridBlockStyles.run.runCompetitorsStyles,
    flexDirection: isSXGridRun ? 'column' : isEvenStage || isFinalStage ? 'column-reverse' : 'column',
  };

  const runIndexAttr = typeof globalRunIndex === 'number' && Number.isFinite(globalRunIndex) ? globalRunIndex : '';

  return `
    <div class="protocol-grid-run" data-stage-index="${stageIndex}" data-run-index="${runIndexAttr}" style="${ctx.stylesToCSS(stageRunComputedStyles)}">
    
      <div class="protocol-grid-run-title" style="${ctx.stylesToCSS(gridBlockStyles.run.runTitleStyles)}">${run.title}</div>
      
      <div style="${ctx.stylesToCSS(runCompetitorsComputedStyles)}">
        ${run.competitors.map((competitor, index) => renderRunCompetitor(dataCtx, { stage, run, competitor, index }, ctx)).join('')}
      </div>
    </div>
  `;
};

export const renderRunCompetitor = (dataCtx, { stage, run, competitor, index }, ctx) => {
  if (isSXFinalGrid(dataCtx, run)) {
    const competitorId = run.competitors[index];
    const athlete = getCompetitorById(dataCtx, competitorId);
    const bib = athlete && athlete.info_data && athlete.info_data.bib ? athlete.info_data.bib : competitorId || '&nbsp;';
    const name = athlete && athlete.info_data && athlete.info_data.name ? athlete.info_data.name : '&nbsp;';
    const laneVar = getHeatCompetitorColor(index + 1);
    const heatResult = Array.isArray(run.results) ? run.results[index] : null;
    const resultValue = heatResult || '-';

    const bibStyles = {
      ...gridBlockStyles.competitor.runCompetitorBibStyles,
      backgroundColor: laneVar ? `var(${laneVar})` : gridBlockStyles.competitor.runCompetitorBibStyles.backgroundColor,
    };

    return `
    <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.competitorWrapperStyles)}">
    
      <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorInfoStyles)}"> 
      
        <div style="${ctx.stylesToCSS(bibStyles)}"> 
            ${bib || '&nbsp;'} 
        </div>
                
        <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorNameStyles)}">
          <div class="shrink-cell">
            ${name || '&nbsp;'}
          </div>
        </div> 
        
      </div>
      
      <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorResultsStyles)}"> 
        <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorScoreStyles)}"> ${resultValue} </div>
      </div>
    </div>
  `;
  }

  const course = index === 0 ? 'blue' : 'red';
  const athlete = getCompetitorById(dataCtx, run.competitors[index].id);

  const marks =
    athlete && athlete.marks.length
      ? athlete.marks.filter((mark) => mark.race_id === stage.id).map((mark) => mark.value)
      : ['&nbsp;', '&nbsp;', '&nbsp;', '&nbsp;', '&nbsp;'];
  const score = athlete && athlete.results.length ? athlete.results.find((result) => result.race_id === stage.id) : '&nbsp;';
  const competitorRunStatus = score ? (hasStatus(score.status) ? score.status : null) : null;

  return `
    <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.competitorWrapperStyles)}">
    
      <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorInfoStyles)}"> 
      
        <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorBibStyles)}; background-color: var(${'--athlete-' + course});"> 
            ${competitor.info_data.bib || '&nbsp;'} 
        </div>
                
        <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorNameStyles)}">
          <div class="shrink-cell">
            ${competitor.info_data.name || '&nbsp;'}
          </div>
        </div> 
        
      </div>
      
      <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorResultsStyles)}"> 
      
        <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorCourseStyles)}"> ${course === 'red' ? 'К' : 'C'} </div>
        
        <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorMarksStyles)}"> 
          ${marks
            .map((mark) =>
              mark !== null
                ? `<div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorMarkStyles)}">${mark}</div>`
                : `<div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorMarkStyles)}">-</div>`
            )
            .join('')} 
        </div>
        
        <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorScoreStyles)}"> ${
    score ? (competitorRunStatus ? competitorRunStatus : score.value || '&nbsp;') : '&nbsp;'
  } </div>
      </div>
    </div>
  `;
};

export const renderCompetitionTop = (dataCtx, ctx) => {
  if (dataCtx && typeof dataCtx.page === 'number' && dataCtx.page > 1) {
    return '';
  }

  const renderWinnersRows = (winners) => {
    if (!Array.isArray(winners) || winners.length === 0) return '';

    const headerRow = `
      <tr style="${ctx.stylesToCSS(competitionTopStyles.headerRow)}">
        <td style="${ctx.stylesToCSS(competitionTopStyles.competitorRank)}">Место</td>
        <td style="${ctx.stylesToCSS(competitionTopStyles.competitorBib)}">НН</td>
        <td style="${ctx.stylesToCSS(competitionTopStyles.competitorName)}">Фамилия, имя</td>
      </tr>
    `;

    const dataRows = winners
      .map(
        (winnerRow, index) => `
          <tr style="${ctx.stylesToCSS(competitionTopStyles.competitorRow)} ${index % 2 > 0 ? 'background-color: #f0f0f0' : ''}">
            <td style="${ctx.stylesToCSS(competitionTopStyles.competitorRank)}">
              ${winnerRow.rank}
            </td>
            <td style="${ctx.stylesToCSS(competitionTopStyles.competitorBib)}">
              ${winnerRow.bib}
            </td>
            <td style="${ctx.stylesToCSS(competitionTopStyles.competitorName)}">
              ${winnerRow.name || '&nbsp;'}
            </td>
          </tr>`
      )
      .join('');

    return `
      <table style="border-collapse: collapse;">
        ${headerRow}
        ${dataRows}
      </table>
    `;
  };

  if (isFinalOfDisciplines(dataCtx, ['SX', 'SXT'])) {
    const raw = getSXFinalClassification(dataCtx) || [];
    const winners = Array.isArray(raw)
      ? raw.map((w) => ({
          rank: w.rank,
          bib: w.bib || '',
          name: w.name || '',
        }))
      : [];

    const rowsHtml = renderWinnersRows(winners);
    if (!rowsHtml) {
      return '';
    }

    return `
    <div style="${ctx.stylesToCSS(competitionTopStyles.wrapper)}">
      ${rowsHtml}
    </div>
  `;
  }

  const dmData = getDMProgressionData({ onlyFinals: true }) || [];
  const winners = Array.isArray(dmData)
    ? dmData
        .filter((item) => item && item.type === 'competitorResult' && item.id !== null && item.id !== undefined)
        .map((item, idx) => ({
          rank: item.overallRank || idx + 1,
          bib: item.bib || (item.info_data && item.info_data.bib) || '',
          name: item.name || (item.info_data && item.info_data.name) || '',
        }))
    : [];

  const rowsHtml = renderWinnersRows(winners);
  if (!rowsHtml) {
    return '';
  }

  return `
    <div style="${ctx.stylesToCSS(competitionTopStyles.wrapper)}">
      ${rowsHtml}
    </div>
  `;
};

export const renderGrid = (dataCtx, races, ctx) => {
  const renderedStages = races.map((stage, index) => renderGridStage(dataCtx, { stage, index }, ctx)).join('');
  const renderedCompetitionTop = renderCompetitionTop(dataCtx, ctx);
  const renderedBracketOverlay = renderBracketOverlaySvg(dataCtx, ctx);

  return {
    renderedStages,
    renderedCompetitionTop,
    renderedBracketOverlay,
  };
};
