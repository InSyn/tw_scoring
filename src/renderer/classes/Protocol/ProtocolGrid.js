import { BaseProtocolComponent } from './ProtocolElement';
import { getDefaultStyles } from '../../configs/protocol-builder-config';
import { getCompetitorById } from '../../utils/competition-utils';
import { hasStatus } from '../RaceClass';
import { getDMProgressionData } from '../../protocolHandlers/tableHandlers';

const gridBlockStyles = {
  stage: {
    stageStyles: {
      '--athlete-red': '#E2050E',
      '--athlete-blue': '#099CE1',
      flex: '1 1 0',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      overflow: 'visible',
      fontSize: '1em',
      color: '#000000',
    },
    stageTitleStyles: {
      flex: '0 0 auto',
      textAlign: 'center',
      fontSize: '0.9em',
    },
    stageRunsStyles: {
      flex: '1 1 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      overflow: 'visible',
      fontSize: '1em',
      color: '#000000',
    },
  },
  run: {
    stageRunStyles: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible',
      paddingTop: '0.25rem',
      paddingBottom: '0.25rem',
      fontSize: '1em',
    },
    runTitleStyles: {
      flex: '0 0 auto',
      display: 'flex',
      overflow: 'hidden',
      fontSize: '0.75em',
    },
    runCompetitorsStyles: {
      flex: '0 0 auto',
      display: 'flex',
      overflow: 'visible',
    },
  },
  competitor: {
    competitorWrapperStyles: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible',
      marginTop: '2px',
    },
    runCompetitorInfoStyles: {
      flex: '0 0 auto',
      display: 'flex',
      overflow: 'visible',
      fontSize: '0.8em',
      lineHeight: '1.2',
    },
    runCompetitorBibStyles: {
      flex: '0 0 auto',
      width: '4ch',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    runCompetitorNameStyles: {
      flex: '1 1 0',
      overflow: 'visible',
      paddingLeft: '0.5em',
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
    },
    runCompetitorResultsStyles: {
      flex: '0 0 auto',
      display: 'flex',
      overflow: 'hidden',
      backgroundColor: '#E3E3E3',
      fontSize: '0.8em',
      lineHeight: '1.2',
    },
    runCompetitorCourseStyles: {
      flex: '0 0 auto',
      width: '4ch',
      borderRight: '1px solid #C0C0C0',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    runCompetitorMarksStyles: {
      flex: '4 1 0',
      display: 'flex',
      overflow: 'hidden',
    },
    runCompetitorMarkStyles: {
      flex: '1 1 2ch',
      borderRight: '1px solid #C0C0C0',
      textAlign: 'center',
    },
    runCompetitorScoreStyles: {
      flex: '1 1 3ch',
      textAlign: 'center',
      fontWeight: 'bold',
    },
  },
};

export class ProtocolGridBlock extends BaseProtocolComponent {
  constructor({ id, type = 'grid', blockName = '', styles = {}, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.blockName = blockName;
    this.styles = { ...getDefaultStyles('block', type), ...styles };
  }
  setBlockName(blockName) {
    this.blockName = blockName;
  }

  render(gridData) {
    const renderedStages = gridData.races.map((stage, index) => renderGridStage(gridData, { stage, index }, this)).join('');
    const renderedCompetitionTop = renderCompetitionTop(gridData, this);

    return `
    <div style="${this.stylesToCSS(this.styles)}" class="protocol-grid">
      ${renderedStages}
      ${renderedCompetitionTop}
    </div>`;
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      blockName: this.blockName,
      styles: this.styles,
    };
  }

  static fromJSON(json) {
    return new ProtocolGridBlock({
      ...json,
    });
  }
}

const renderGridStage = (dataCtx, { stage, index }, ctx) => {
  if (!stage.runs) return '<strong style="color: red">No runs to render</strong>';

  const isEvenStage = (dataCtx.races.length - 1 - index) % 2 === 0 && index !== dataCtx.races.length - 1;
  const isSemiFinalStage = index === dataCtx.races.length - 2;
  const isFinalStage = index === dataCtx.races.length - 1;

  const stageComputedStyles = {
    ...gridBlockStyles.stage.stageStyles,
    marginLeft: `${index > 0 ? '2em' : '0'}`,
  };
  const stageRunsComputedStyles = {
    ...gridBlockStyles.stage.stageRunsStyles,
    justifyContent: isSemiFinalStage || isFinalStage ? 'center' : 'flex-start',
  };

  if (isEvenStage) stageComputedStyles.backgroundColor = 'var(--even-stage-color)';

  return `
    <div  style="${ctx.stylesToCSS(stageComputedStyles)}">
    
      <div style="${ctx.stylesToCSS(gridBlockStyles.run.runTitleStyles)}">${stage.title}</div>
      
      <div style="${ctx.stylesToCSS(stageRunsComputedStyles)}">
          ${stage.runs.map((run) => renderGridRun(dataCtx, { stage, isEvenStage, isSemiFinalStage, isFinalStage, run }, ctx)).join('')}
      </div>
    </div>
  `;
};

const renderGridRun = (dataCtx, { stage, isEvenStage, isSemiFinalStage, isFinalStage, run }, ctx) => {
  if (!run.competitors && !run.competitors.length) return '<strong style="color: red">No competitors to render the run</strong>';

  const stageRunComputedStyles = {
    ...gridBlockStyles.run.stageRunStyles,
    marginTop: isFinalStage ? '0' : 'auto',
    marginBottom: isFinalStage ? '2rem' : 'auto',
  };
  const runCompetitorsComputedStyles = {
    ...gridBlockStyles.run.runCompetitorsStyles,
    flexDirection: isEvenStage || isFinalStage ? 'column-reverse' : 'column',
  };

  return `
    <div style="${ctx.stylesToCSS(stageRunComputedStyles)}">
    
      <div style="${ctx.stylesToCSS(gridBlockStyles.run.runTitleStyles)}">${run.title}</div>
      
      <div style="${ctx.stylesToCSS(runCompetitorsComputedStyles)}">
        ${run.competitors.map((competitor, index) => renderRunCompetitor(dataCtx, { stage, run, competitor, index }, ctx)).join('')}
      </div>
    </div>
  `;
};

const renderRunCompetitor = (dataCtx, { stage, run, competitor, index }, ctx) => {
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
                
        <div style="${ctx.stylesToCSS(gridBlockStyles.competitor.runCompetitorNameStyles)}"> ${competitor.info_data.name || '&nbsp;'} </div> 
        
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

const competitionTopStyles = {
  wrapper: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    bottom: '1em',
    right: '1em',
  },
  title: {
    flex: '0 0 auto',
    display: 'flex',
    padding: '2px',
    marginBottom: '4px',
  },
  competitorRow: {
    flex: '0 0 auto',
    display: 'flex',
    padding: '2px',
  },
  competitorRank: {
    flex: '0 0 auto',
    display: 'flex',
    padding: '2px',
  },
  competitorBib: {
    flex: '0 0 auto',
    display: 'flex',
    padding: '2px',
  },
  competitorName: {
    flex: '1 1 0',
    display: 'flex',
    padding: '2px',
  },
};

const renderCompetitionTop = (dataCtx, ctx) => {
  const winners = getDMProgressionData({ onlyFinals: true }) || [];

  return `
    <div style="${ctx.stylesToCSS(competitionTopStyles.wrapper)}">
      <div style="${ctx.stylesToCSS(competitionTopStyles.title)}"></div>
      ${winners
        .filter((athlete) => athlete.id !== null && athlete.id !== undefined)
        .map(
          (winnerRow) => `<div style="${ctx.stylesToCSS(competitionTopStyles.competitorRow)}">
            <div style="${ctx.stylesToCSS(competitionTopStyles.wrapper)}">
              ${winnerRow.bib}
            </div>
          </div>`
        )
        .join('')}
    </div>
  `;
};
