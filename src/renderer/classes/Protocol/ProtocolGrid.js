import { BaseProtocolComponent } from './ProtocolElement';
import { getDefaultStyles } from '../../configs/protocol-builder-config';
import { buildGridRaces } from './grid/grid-data';
import { renderGrid } from './grid/grid-renderers';
import { splitGridIntoPagesImpl } from './grid/grid-pagination';

export class ProtocolGridBlock extends BaseProtocolComponent {
  constructor({ id, type = 'grid', blockName = '', styles = {}, onUpdate = null }) {
    super({ id, onUpdate });
    this.type = type;
    this.blockName = blockName;
    this.styles = { ...getDefaultStyles('block', type), ...styles };

    if (this.styles.height === '500px' || this.styles.height === '500') {
      this.styles.height = 'auto';
    }
    this.styles.overflow = 'visible';

    this.pageSegments = null;
    this._gridLayout = null;
  }

  setBlockName(blockName) {
    this.blockName = blockName;
  }

  render(gridData) {
    if (!gridData) {
      return '';
    }

    const races = buildGridRaces(gridData);
    if (!races.length) {
      return '';
    }

    const layout = this._gridLayout || {};
    const pageSegments = this.pageSegments || null;
    const targetHeight = layout && typeof layout.targetHeight === 'number' && layout.targetHeight > 0 ? layout.targetHeight : null;

    const runsPerStage = [];
    let totalRuns = 0;

    races.forEach((stage, index) => {
      if (!stage || !Array.isArray(stage.runs)) return;

      let count = stage.runs.length;
      if (pageSegments && pageSegments[index]) {
        const { start, end } = pageSegments[index];
        count = Math.max(0, Math.min(end, stage.runs.length) - start);
      }

      runsPerStage[index] = count;
      totalRuns += count;
    });

    if (layout && typeof layout === 'object') {
      layout.runsPerStage = runsPerStage;
      layout.totalRuns = totalRuns;
    }

    const totalRunsCount = layout.totalRuns || 0;
    if (layout && typeof layout === 'object' && layout.slack > 0 && totalRunsCount > 0) {
      const extraPerRun = Math.min(layout.slack / (totalRunsCount * 2), 24);
      layout.extraPerRun = extraPerRun;
    }

    const innerWrapperStyleObj = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
      width: '100%',
      height: '100%',
      position: 'relative',
    };

    if (targetHeight !== null) {
      innerWrapperStyleObj.height = `${targetHeight}px`;
    }

    const dataCtx = { ...gridData, races };
    const { renderedStages, renderedCompetitionTop, renderedBracketOverlay } = renderGrid(dataCtx, races, this);

    return `
      <div style="${this.stylesToCSS(this.styles)}" class="protocol-grid">
        <div class="protocol-grid-inner" style="${this.stylesToCSS(innerWrapperStyleObj)}">
          ${renderedStages}
          ${renderedCompetitionTop}
          ${renderedBracketOverlay}
        </div>
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
    const { pageSegments, ...rest } = json || {};
    return new ProtocolGridBlock({
      ...rest,
    });
  }
}

export function splitGridIntoPages(options) {
  return splitGridIntoPagesImpl(options, ProtocolGridBlock);
}
