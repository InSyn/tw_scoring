export const generateHTMLTemplate = (title, headers, rows) => {
  const titlesArr = title
    .split('|')
    .map((titleString, idx) => `<h${2 + idx}>${titleString}</h${2 + idx}>`)
    .join('');
  const tableHeaders = headers.map((header) => `<th>${header}</th>`).join('');
  const tableRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell || ''}</td>`).join('')}</tr>`).join('');

  return `
    <html lang="ru">
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; color: #f9f9fd; background-color: rgba(0,0,0,0.33); border-radius: 4px }
          th, td { padding: 3px 6px; text-align: left; }
          th { background-color: rgba(32,34,39,0.33); }
        </style>
      </head>
      <body>
        <div>
          ${titlesArr}
        </div>
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

export const generateStartListHTML = (startList, competitionInfo) => {
  const headers = startList[0] ? Object.keys(startList[0]) : [];
  const rows = startList.map((comp) => (headers.length ? headers.map((header) => comp[header] || ' ') : []));

  return generateHTMLTemplate(`${competitionInfo.title}|Старт-Лист`, headers, rows);
};

export const generateResultsHTML = (results, competitionInfo) => {
  const headers = results[0] ? Object.keys(results[0]) : [];
  const rows = results.map((comp) => (headers.length ? headers.map((header) => comp[header] || ' ') : []));

  return generateHTMLTemplate(`${competitionInfo.title}|Результаты`, headers, rows);
};

export const generateOnStartHTML = (onStart, competitionInfo) => {
  const headers = onStart[0] ? Object.keys(onStart[0]) : [];
  const rows = onStart.map((comp) => (headers.length ? headers.map((header) => comp[header] || ' ') : []));

  return generateHTMLTemplate(`${competitionInfo.title}|На старте`, headers, rows);
};

export const generateFinishedHTML = (finishedCompetitors, competitionInfo) => {
  const headers = finishedCompetitors[0] ? Object.keys(finishedCompetitors[0]) : [];
  const rows = finishedCompetitors.map((comp) => (headers.length ? headers.map((header) => comp[header] || ' ') : []));

  return generateHTMLTemplate(`${competitionInfo.title}|На финише`, headers, rows);
};

export const generateDMBracketsHTML = (brackets, competitionInfo) => {
  const headers = ['Этап', 'Номер проезда', 'Участники'];
  const rows = brackets.flatMap((round) =>
    round.runs.map((run) => [round.stage, run.run_num, run.participants.map((p) => `${p.name} (${p.course})`).join(', ')])
  );

  return generateHTMLTemplate(`Dual Moguls Brackets - ${competitionInfo.title}`, headers, rows);
};
