export const gridBlockStyles = {
  stage: {
    stageStyles: {
      '--athlete-red': '#E2050E',
      '--athlete-blue': '#099CE1',
      flex: '1 1 0',
      minWidth: '0',
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
      // Measurement baseline: runs container grows with content, no forced stretch.
      flex: '0 0 auto',
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
      minWidth: '0',
      overflow: 'hidden',
      maxWidth: '100%',
      paddingLeft: '2px',
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

export const competitionTopStyles = {
  wrapper: {
    position: 'absolute',
    bottom: '1em',
    right: '1em',
    color: 'black',
  },
  headerRow: {
    borderBottom: '1px solid grey',
    fontSize: '1em',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  competitorRow: {
    fontSize: '1.25em',
  },
  competitorRank: {
    width: '3em',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  competitorBib: {
    width: '3em',
    textAlign: 'center',
  },
  competitorName: {
    whiteSpace: 'nowrap',
  },
};
