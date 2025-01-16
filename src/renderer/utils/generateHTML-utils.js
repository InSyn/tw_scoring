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
  const headers = ['Ст.№', 'Н\\Н', 'Имя', 'Регион'];
  const rows = startList.map((comp) => [comp.start_order, comp.bib, comp.fullname, comp.country]);

  return generateHTMLTemplate(`${competitionInfo.title}|Старт-Лист`, headers, rows);
};
export const generateResultsHTML = (results, competitionInfo) => {
  const headers = ['Место', 'Н\\Н', 'Имя', 'Рез-т'];
  const rows = results.map((comp) => [comp.rank, comp.bib, comp.fullname, comp.result]);

  return generateHTMLTemplate(`${competitionInfo.title}|Результаты`, headers, rows);
};
export const generateOnStartHTML = (onStart, competitionInfo) => {
  const headers = ['Н\\Н', 'Имя', 'Регион'];
  const rows = onStart.map((comp) => [comp.bib, comp.fullname, comp.country]);

  return generateHTMLTemplate(`${competitionInfo.title}|На старте`, headers, rows);
};

export const generateFinishedHTML = (finishedCompetitors, competitionInfo) => {
  const headers = ['Место', 'Н\\Н', 'Имя', 'Рез-т'];
  const rows = finishedCompetitors.map((comp) => [comp.rank, comp.bib, comp.fullname, comp.result]);

  return generateHTMLTemplate(`${competitionInfo.title}|На финише`, headers, rows);
};

export const generateDMBracketsHTML = (brackets, competitionInfo) => {
  const headers = ['Этап', 'Номер проезда', 'Участники'];
  const rows = brackets.flatMap((round) =>
    round.runs.map((run) => [round.stage, run.run_num, run.participants.map((p) => `${p.name} (${p.course})`).join(', ')])
  );

  return generateHTMLTemplate(`Dual Moguls Brackets - ${competitionInfo.title}`, headers, rows);
};
