import { ProtocolDataFieldClass } from '../classes/ProtocolDataFieldClass';
import { skiRamps } from '../store/modules/skiRamps';
import { cutMarks, roundNumber } from './utils';
import store from '../store';

export const generateProtocolField = ({ type, id, title, width, font, f_weight, align, judge, cell_2 }) => {
  const handler = type ? protocolHandlers[type] : null;
  if (!handler) return;

  return new ProtocolDataFieldClass({
    width: width || 6,
    font: font || 8,
    f_weight: f_weight || 'normal',
    align: align || 'start',
    cell_1: {
      data: { id: id || '', title: title || '' },
      handler_type: type,
      handler: function (protocolFieldData) {
        return handler(protocolFieldData, { id: id || '', judge: judge || {} });
      },
    },
    cell_2: cell_2
      ? {
          data: {
            id: cell_2.data && cell_2.data.id ? cell_2.data.id : '',
            title: cell_2.data && cell_2.data.title ? cell_2.data.title : '',
          },
          handler_type: cell_2.handler_type || null,
          handler: cell_2.handler_type
            ? function (data) {
                return protocolHandlers[cell_2.handler_type](data);
              }
            : function () {
                return 0;
              },
        }
      : null,
  });
};

const findCompetitionById = (id) => {
  const competitions = store.getters['main/competitions'];

  return competitions.find((competition) => {
    return competition.id === id;
  });
};

export const protocolHandlers = {
  'athlete:startPlace': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return [
      competition
        ? competition.protocol_settings.start_protocols.filters.race_filter._startList.indexOf(
            protocolFieldData.competitor ? protocolFieldData.competitor.id : ''
          ) + 1
        : '',
    ];
  },
  'athlete:info': (protocolFieldData, { id }) => {
    if (!protocolFieldData.competitor || !protocolFieldData.competitor.info_data) return '';
    return [protocolFieldData.competitor.info_data[id] || ' '];
  },
  'athlete:rank': (protocolFieldData) => {
    if (!protocolFieldData.result) return ' ';
    if (protocolFieldData.result.status) return ' ';
    return [protocolFieldData.s_rank];
  },

  'judge:score': (protocolFieldData, { judge }) => {
    if (!judge) {
      console.error('Judge reference is missing:', protocolFieldData);
      return '-';
    }
    return protocolFieldData.competitor.marks.filter((_mark) => _mark.judge == judge.id).map((_mark) => _mark.value) || '-';
  },

  'race:title': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return [...competition.races.map((race) => race.title)];
  },
  'race:overall': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((_race) => {
      return [`${competition.getRaceResult(protocolFieldData.competitor, _race)}`];
    });
  },
  overall: (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return [competition.getOverallResult(protocolFieldData.competitor.id)];
  },

  skiJump_distance: (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const result = protocolFieldData.competitor.results.find((result) => result.race_id === race.id);

      if (!result || !result.sjDistance) return ['-'];
      return [result.sjDistance];
    });
  },
  skiJump_points: (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const result = protocolFieldData.competitor.results.find((result) => result.race_id === race.id);

      if (!result || !result.sjDistance) return ['-'];
      return skiRamps[result.sjRamp]
        ? [competition.roundWithPrecision(60 + skiRamps[result.sjRamp].lengthPoints * (parseFloat(result.sjDistance) - skiRamps[result.sjRamp].keyPoint))]
        : [competition.roundWithPrecision(0)];
    });
  },

  'ae_total:air': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const airMarks = cutMarks(
        competition.stuff.judges.map((judge) => {
          return protocolFieldData.competitor.marks
            .filter((_mark, m_idx, _marks) => {
              return _mark.judge === judge.id && _mark.race_id === race.id;
            })
            .map((_mark) => {
              return _mark.value_ae.air;
            });
        }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );

      if (airMarks.length > 0) return [competition.roundWithPrecision(airMarks.reduce((air1, air2) => +air1 + +air2, 0))];

      return [' '];
    });
  },
  'ae_total:form': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const formMarks = cutMarks(
        competition.stuff.judges.map((judge) => {
          return protocolFieldData.competitor.marks
            .filter((_mark, m_idx, _marks) => {
              return _mark.judge === judge.id && _mark.race_id === race.id;
            })
            .map((_mark) => {
              return _mark.value_ae.form;
            });
        }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );

      if (formMarks.length > 0) return [competition.roundWithPrecision(formMarks.reduce((air1, air2) => +air1 + +air2, 0))];

      return [' '];
    });
  },
  'ae_total:landing': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const landingMarks = cutMarks(
        competition.stuff.judges.map((judge) => {
          return protocolFieldData.competitor.marks
            .filter((_mark, m_idx, _marks) => {
              return _mark.judge === judge.id && _mark.race_id === race.id;
            })
            .map((_mark) => {
              return _mark.value_ae.landing;
            });
        }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );

      if (landingMarks.length > 0) return [competition.roundWithPrecision(landingMarks.reduce((air1, air2) => +air1 + +air2, 0))];

      return [' '];
    });
  },
  'ae_jump:dd': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return protocolFieldData.competitor.results
      .filter((result) => competition.races.some((race) => race.id === result.race_id))
      .map((result) => [result.code || ' ', result.degree_difficulty || ' ']);
  },
  'ae_score:type': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map(() => ['Air', 'Form', 'LDG', 'Total']);
  },
  'ae_score:value': (protocolFieldData, { judge }) => {
    return protocolFieldData.competitor.marks
      .filter((_mark, m_idx, _marks) => {
        return _mark.judge === judge.id;
      })
      .map((_mark) => {
        return [_mark.value_ae.air || '-', _mark.value_ae.form || '-', _mark.value_ae.landing || '-', ' '];
      });
  },
  'ae_score:total': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map(() => {
      const airScores = cutMarks(
        protocolFieldData.competitor.marks.map((_mark) => {
          return +_mark.value_ae.air || 0;
        }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );
      const formScores = cutMarks(
        protocolFieldData.competitor.marks.map((_mark) => {
          return +_mark.value_ae.form || 0;
        }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );
      const landingScores = cutMarks(
        protocolFieldData.competitor.marks.map((_mark) => {
          return +_mark.value_ae.landing || 0;
        }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );

      const airSum = airScores.reduce((form1, form2) => +form1 + +form2, 0);
      const formSum = formScores.reduce((air1, air2) => +air1 + +air2, 0);
      const landingSum = landingScores.reduce((landing1, landing2) => +landing1 + +landing2, 0);

      const totalSum = competition.roundWithPrecision(airSum + formSum + landingSum);

      return [totalSum];
    });
  },
  'ae_score:total-afl': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const airScores = cutMarks(
        protocolFieldData.competitor.marks
          .filter((mark) => mark.race_id === race.id)
          .map((_mark) => {
            return +_mark.value_ae.air || 0;
          }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );
      const formScores = cutMarks(
        protocolFieldData.competitor.marks
          .filter((mark) => mark.race_id === race.id)
          .map((_mark) => {
            return +_mark.value_ae.form || 0;
          }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );
      const landingScores = cutMarks(
        protocolFieldData.competitor.marks
          .filter((mark) => mark.race_id === race.id)
          .map((_mark) => {
            return +_mark.value_ae.landing || 0;
          }),
        competition.result_formula.types[0].higher_marks,
        competition.result_formula.types[0].lower_marks
      );

      const airSum = airScores.reduce((form1, form2) => +form1 + +form2, 0);
      const formSum = formScores.reduce((air1, air2) => +air1 + +air2, 0);
      const landingSum = landingScores.reduce((landing1, landing2) => +landing1 + +landing2, 0);

      const totalSum = competition.roundWithPrecision(airSum + formSum + landingSum);

      return [
        competition.roundWithPrecision(airSum),
        competition.roundWithPrecision(formSum),
        competition.roundWithPrecision(landingSum),
        competition.roundWithPrecision(totalSum),
      ];
    });
  },

  'mg:time': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const result = protocolFieldData.competitor.results.find((result) => result.race_id === race.id);
      if (result && result.mgRunParams.runTime) return result.mgRunParams.runTime;
      return '-';
    });
  },
  'mg:time-sum': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    const group = protocolFieldData.competitor.info_data['group']
      ? protocolFieldData.competitor.info_data['group']
      : competition.mainData.title.stage.group || 'men';

    return competition.races.map((race) => {
      const result = protocolFieldData.competitor.results.find((result) => result.race_id === race.id);
      if (!result) return;

      const paceTime = result.mgRunParams[`paceTime_${group}`] || 0;
      const runTimePointsSum = 48 - (32 * result.mgRunParams.runTime) / paceTime;
      const runTimePoints = runTimePointsSum >= 20 ? 20 : runTimePointsSum <= 0 ? 0 : roundNumber(48 - (32 * result.mgRunParams.runTime) / paceTime, 1);

      return [' ', ' ', runTimePoints || 0];
    });
  },
  'mg:jumps-score': (protocolFieldData, { judge }) => {
    return protocolFieldData.competitor.marks
      .filter((mark) => {
        return mark.judge === judge.id;
      })
      .map((mark) => {
        if (!mark) return '-';
        return [mark.moguls_value.jump1_score ? mark.moguls_value.jump1_score : '-', mark.moguls_value.jump2_score ? mark.moguls_value.jump2_score : '-', ' '];
      });
  },
  'mg:jumps-code': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const result = protocolFieldData.competitor.results.find((result) => result.race_id === race.id);
      if (!result) return;

      const jump1Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump1_code);
      const jump2Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump2_code);
      return [jump1Code ? jump1Code.code : '-', jump2Code ? jump2Code.code : '-'];
    });
  },
  'mg:jumps-coef': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    const group = protocolFieldData.competitor.info_data['group']
      ? protocolFieldData.competitor.info_data['group']
      : competition.mainData.title.stage.group || 'men';

    return competition.races.map((race) => {
      const result = protocolFieldData.competitor.results.find((result) => result.race_id === race.id);
      if (!result) return;

      const jump1Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump1_code);
      const jump2Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump2_code);
      return [
        jump1Code ? roundNumber(jump1Code[`value_${group}`], 2).toFixed(2) : '-',
        jump2Code ? roundNumber(jump2Code[`value_${group}`], 2).toFixed(2) : '-',
      ];
    });
  },
  'mg:jumps-sum': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    const group = protocolFieldData.competitor.info_data['group']
      ? protocolFieldData.competitor.info_data['group']
      : competition.mainData.title.stage.group || 'men';

    return competition.races.map((race) => {
      const result = protocolFieldData.competitor.results.find((result) => result.race_id === race.id);
      if (!result) return;

      const jumpScores = protocolFieldData.competitor.marks.filter(
        (mark) => mark.race_id === race.id && mark.moguls_value.jump1_score && mark.moguls_value.jump2_score
      );

      const jump1Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump1_code);
      const jump1_coef = jump1Code ? Number(jump1Code[`value_${group}`]) : 0;

      const jump2Code = competition.mg_codes.find((jCode) => jCode.code === result.mgRunParams.jump2_code);
      const jump2_coef = jump2Code ? Number(jump2Code[`value_${group}`]) : 0;

      const jump1_scores = jumpScores
        .map((mark) => (mark.moguls_value.jump1_score ? roundNumber(mark.moguls_value.jump1_score * jump1_coef, 2) : 0))
        .filter((mark) => !!mark);
      const jump2_scores = jumpScores
        .map((mark) => (mark.moguls_value.jump2_score ? roundNumber(mark.moguls_value.jump2_score * jump2_coef, 2) : 0))
        .filter((mark) => !!mark);

      let judge1_jumpSum = jump1_scores.reduce((acc, val) => acc + Number(val), 0);
      if (judge1_jumpSum >= 20) judge1_jumpSum = 20;

      let judge2_jumpSum = jump2_scores.reduce((acc, val) => acc + Number(val), 0);
      if (judge2_jumpSum >= 20) judge2_jumpSum = 20;

      const jumpsSum = roundNumber((judge1_jumpSum + judge2_jumpSum) / 2, 1);

      return [' ', ' ', jumpsSum.toFixed(1)];
    });
  },
  'mg:turns-score': (protocolFieldData, { judge }) => {
    return protocolFieldData.competitor.marks
      .filter((mark) => {
        return mark.judge === judge.id;
      })
      .map((mark) => {
        return [mark.moguls_value.baseScore || '-', mark.moguls_value.deduction ? '-' + mark.moguls_value.deduction : '-', ' '];
      });
  },
  'mg:turns-sum': (protocolFieldData) => {
    const competition = findCompetitionById(protocolFieldData.comp_id);

    return competition.races.map((race) => {
      const turnsSum = protocolFieldData.competitor.marks
        .filter((mark) => mark.race_id === race.id && mark.moguls_value.baseScore && mark.moguls_value.deduction)
        .reduce((sum, mark) => sum + (Number(mark.moguls_value.baseScore) - Number(mark.moguls_value.deduction)), 0);

      return [' ', ' ', roundNumber(turnsSum, 1).toFixed(1)];
    });
  },
};

export const fixProtocolField = (protocolData, judges) => {
  const judge = judges.find((j) => {
    const isJudgeHeader = protocolData.params.cell_1.id.toString().startsWith('Judge ');
    const judgeId = isJudgeHeader ? protocolData.params.cell_1.id.split(' ')[1] : null;
    return isJudgeHeader && judgeId === j.id.toString();
  });

  const handlerType1 = protocolData.params.cell_1.handler_type;
  const handler1 =
    handlerType1 && protocolHandlers[handlerType1]
      ? protocolHandlers[handlerType1]
      : () => {
          console.warn(`Handler for type "${handlerType1}" not found.`);
          return '-';
        };

  const cell2HandlerType = protocolData.params.cell_2 && protocolData.params.cell_2.handler_type;
  const cell2Handler =
    cell2HandlerType && protocolHandlers[cell2HandlerType]
      ? protocolHandlers[cell2HandlerType]
      : () => {
          console.warn(`Handler for type "${cell2HandlerType}" not found.`);
          return '-';
        };

  return generateProtocolField({
    type: handlerType1,
    id: protocolData.params.cell_1.id,
    title: protocolData.params.cell_1.title,
    width: protocolData.params.width,
    font: protocolData.params.font,
    f_weight: protocolData.params.f_weight,
    align: protocolData.params.align,
    judge: judge,
    cell_2: protocolData.params.cell_2
      ? {
          data: {
            id: protocolData.params.cell_2.data && protocolData.params.cell_2.data.id,
            title: protocolData.params.cell_2.data && protocolData.params.cell_2.data.title,
          },
          handler_type: cell2HandlerType,
          handler: cell2Handler,
        }
      : null,
  });
};
