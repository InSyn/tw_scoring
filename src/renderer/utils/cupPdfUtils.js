import html2pdf from 'html2pdf.js';
import jsPDF from 'jspdf';

// Конвертация изображения в base64
const imageToBase64 = (imagePath) => {
  try {
    const fs = require('fs');
    const path = require('path');
    if (!imagePath || !fs.existsSync(imagePath)) {
      console.warn('[CUPS PDF] Image file not found:', imagePath);
      return null;
    }
    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === '.png') {
      mimeType = 'image/png';
    }
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('[CUPS PDF] Error converting image to base64:', error);
    return null;
  }
};

const getCompetitorField = (competitor, field, defaultValue = '') => {
  if (!competitor) return defaultValue;
  if (competitor.info_data && competitor.info_data[field] !== undefined) {
    return competitor.info_data[field];
  }
  return defaultValue;
};

const getCompetitorName = (competitor) => {
  if (!competitor) return '';
  const info = competitor.info_data || {};
  const name = info.name || '';
  const lastname = info.lastname || '';
  if (name && lastname) {
    return `${lastname.toUpperCase()} ${name}`;
  }
  return name || lastname || '';
};

const getCompetitorYear = (competitor) => {
  return getCompetitorField(competitor, 'year') || getCompetitorField(competitor, 'year_of_birth') || '';
};

const getCompetitorRank = (competitor) => {
  return getCompetitorField(competitor, 'rank') || getCompetitorField(competitor, 'category') || '';
};

const getCompetitorRegion = (competitor) => {
  return getCompetitorField(competitor, 'region') || '';
};

const getCompetitorOrganization = (competitor) => {
  return getCompetitorField(competitor, 'organization') || '';
};

const findCompetitorInStages = (cup, ffrId, competitorId) => {
  for (const stage of cup.stages) {
    if (!stage.competitionSnapshot) continue;
    try {
      const competition = stage.competitionSnapshot;
      const competitors = (competition.competitorsSheet && competition.competitorsSheet.competitors) || [];
      for (const comp of competitors) {
        const compId = comp.id || (comp.info_data && comp.info_data.bib);
        const compFfrId = getCompetitorField(comp, 'ffr_id');
        if (
          (competitorId && compId === competitorId) ||
          (ffrId && compFfrId && compFfrId.toString() === ffrId.toString())
        ) {
          return comp;
        }
      }
    } catch (error) {
      console.warn('[CUPS PDF] Failed to search competitor in stage', error);
    }
  }
  return null;
};

const generateCupPdfHtml = (cup, stagesData) => {
  const cupTitle = cup.title || 'Кубок';
  const stages = cup.stages || [];
  const standings = cup.standings || [];

  const getDisciplineName = () => {
    for (const stage of stages) {
      if (stage.meta && stage.meta.discipline) {
        return stage.meta.discipline;
      }
    }
    return '';
  };

  const getGenderLabel = () => {
    const firstStage = stages[0];
    if (!firstStage || !firstStage.competitionSnapshot) return '';
    const competition = firstStage.competitionSnapshot;
    const group = (competition.mainData && competition.mainData.title && competition.mainData.title.stage && competition.mainData.title.stage.group) || '';
    if (group && (group.toLowerCase().includes('жен') || group.toLowerCase().includes('women') || group.toLowerCase().includes('w'))) {
      return 'женщины';
    }
    if (group && (group.toLowerCase().includes('муж') || group.toLowerCase().includes('men') || group.toLowerCase().includes('m'))) {
      return 'мужчины';
    }
    return '';
  };

  const getSeason = () => {
    const dates = stages
      .map((stage) => {
        if (stage.meta && stage.meta.date) {
          const dateStr = stage.meta.date;
          const yearMatch = dateStr.match(/\d{4}/);
          return yearMatch ? parseInt(yearMatch[0], 10) : null;
        }
        return null;
      })
      .filter(Boolean);
    if (dates.length === 0) return '';
    const minYear = Math.min(...dates);
    const maxYear = Math.max(...dates);
    if (minYear === maxYear) {
      return `${minYear}-${minYear + 1}`;
    }
    return `${minYear}-${maxYear}`;
  };

  const discipline = getDisciplineName();
  const gender = getGenderLabel();
  const season = getSeason();

  // Получаем информацию для футера
  const getFooterInfo = () => {
    const firstStage = stages[0];
    let date = '';
    let location = '';
    let codex = '';

    if (firstStage && firstStage.meta) {
      date = firstStage.meta.date || '';
      // Пытаемся получить место из разных источников
      if (firstStage.meta.location) {
        location = firstStage.meta.location;
      } else if (firstStage.competitionSnapshot && firstStage.competitionSnapshot.mainData) {
        const mainData = firstStage.competitionSnapshot.mainData;
        if (mainData.location && mainData.location.value) {
          location = mainData.location.value;
        } else if (mainData.title && mainData.title.stage && mainData.title.stage.location) {
          location = mainData.title.stage.location;
        }
      }
    }

    // Пытаемся получить кодекс из cup.liveEventId или из метаданных
    if (cup.liveEventId) {
      codex = cup.liveEventId;
    } else if (firstStage && firstStage.meta && firstStage.meta.codex) {
      codex = firstStage.meta.codex;
    } else if (firstStage && firstStage.competitionSnapshot && firstStage.competitionSnapshot.mainData) {
      const mainData = firstStage.competitionSnapshot.mainData;
      if (mainData.codex && mainData.codex.value) {
        codex = mainData.codex.value;
      }
    }

    return { date, location, codex };
  };

  const footerInfo = getFooterInfo();

  // Получаем данные секретаря из первого этапа
  const getSecretaryInfo = () => {
    const firstStage = stages[0];
    if (!firstStage || !firstStage.competitionSnapshot) {
      return { name: '', surName: '', category: '', date: '', hasData: false };
    }
    
    const competition = firstStage.competitionSnapshot;
    let secretaryName = '';
    let secretarySurName = '';
    let secretaryCategory = '';
    let secretaryDate = '';
    
    // Пытаемся найти главного секретаря в stuff.jury
    if (competition.stuff && competition.stuff.jury && Array.isArray(competition.stuff.jury)) {
      const chiefSecretary = competition.stuff.jury.find((jury) => {
        const title = (jury.title || '').toLowerCase();
        return title.includes('главный секретарь') || 
               title.includes('гск') ||
               (jury.id === 'chief' && title.includes('секретарь'));
      });
      
      if (chiefSecretary) {
        secretaryName = (chiefSecretary.name || '').trim();
        secretarySurName = (chiefSecretary.lastName || chiefSecretary.surName || '').trim();
        secretaryCategory = (chiefSecretary.category || '').trim();
      }
    }
    
    // Если не нашли в jury, пробуем из competition.secretary
    if (!secretaryName && !secretarySurName && competition.secretary) {
      secretaryName = (competition.secretary.name || '').trim();
      secretarySurName = (competition.secretary.surName || '').trim();
    }
    
    // Проверяем, есть ли данные секретаря
    const hasSecretaryData = (secretaryName && secretaryName.length > 0) || 
                              (secretarySurName && secretarySurName.length > 0);
    
    // Получаем дату из метаданных только если есть данные секретаря
    if (hasSecretaryData) {
      if (firstStage.meta && firstStage.meta.date) {
        secretaryDate = firstStage.meta.date;
      } else if (competition.mainData && competition.mainData.date && competition.mainData.date.value) {
        secretaryDate = competition.mainData.date.value;
      }
      
      // Форматируем дату
      if (secretaryDate) {
        try {
          const dateObj = new Date(secretaryDate);
          if (!isNaN(dateObj.getTime())) {
            const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
            const day = dateObj.getDate();
            const month = months[dateObj.getMonth()];
            const year = dateObj.getFullYear();
            secretaryDate = `${day} ${month} ${year} г.`;
          }
        } catch (e) {
          // Оставляем дату как есть
        }
      }
    }
    
    return {
      name: secretaryName,
      surName: secretarySurName,
      category: secretaryCategory,
      date: secretaryDate,
      hasData: hasSecretaryData,
    };
  };

  const secretaryInfo = getSecretaryInfo();

  // Загружаем логотипы
  const ffrLogoPath = 'C:\\Users\\user\\Documents\\tw_scoring-main\\tw_scoring-main\\FFR_logo.png';
  const minsportLogoPath = 'C:\\Users\\user\\Documents\\tw_scoring-main\\tw_scoring-main\\Минспорт-РФ.png';
  const ffrLogoBase64 = imageToBase64(ffrLogoPath);
  const minsportLogoBase64 = imageToBase64(minsportLogoPath);

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        @page {
          margin: 6mm;
          size: A4 landscape;
        }
        body {
          font-family: Arial, serif;
          font-size: 10pt;
          line-height: 1.2;
          margin: 0;
          padding: 0;
          color: #000000;
        }
        .content-wrapper {
          position: relative;
          min-height: calc(100vh - 20mm);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          position: relative;
        }
        .header-logo {
          height: 40px;
          width: auto;
          max-width: 120px;
          object-fit: contain;
        }
        .header-logo-left {
          flex-shrink: 0;
        }
        .header-logo-right {
          flex-shrink: 0;
        }
        .title-section {
          text-align: center;
          flex: 1;
          padding: 0 10px;
        }
        .main-title {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 0px;
          line-height: 1.2;
        }
        .subtitle {
          font-size: 10pt;
          margin-top: 0px;
          line-height: 1.2;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          font-size: 8pt;
          line-height: 1.2;
        }
        tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        th, td {
          border: 0.5px solid #000;
          padding: 4px 6px;
          text-align: left;
          vertical-align: top;
        }
        th {
          background-color: #ffffff;
          font-weight: bold;
          text-align: center;
          font-size: 8pt;
          line-height: 1.2;
        }
        .col-place { width: 3%; }
        .col-ffr { width: 5%; }
        .col-name { width: 15%; }
        .col-year { width: 5%; }
        .col-rank { width: 5%; }
        .col-region { width: 12%; }
        .col-org { width: 15%; }
        .col-stage { width: 6%; text-align: center; }
        .col-total { width: 5%; text-align: center; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-logo-left">
          ${ffrLogoBase64 ? `<img src="${ffrLogoBase64}" class="header-logo" alt="FFR" />` : '<div style="width: 120px;"></div>'}
        </div>
        <div class="title-section">
          <div class="main-title">ОБЩИЙ ЗАЧЕТ КУБКА РОССИИ ПО ФРИСТАЙЛУ</div>
          <div class="subtitle">дисциплина ${discipline || '—'}</div>
          ${season ? `<div class="subtitle">Сезон ${season}${gender ? ` (${gender})` : ''}</div>` : ''}
        </div>
        <div class="header-logo-right">
          ${minsportLogoBase64 ? `<img src="${minsportLogoBase64}" class="header-logo" alt="Минспорт" />` : '<div style="width: 120px;"></div>'}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th class="col-place" rowspan="2">Место</th>
            <th class="col-ffr" rowspan="2">FFR-ID</th>
            <th class="col-name" rowspan="2">Фамилия, Имя</th>
            <th class="col-year" rowspan="2">Год. рожд.</th>
            <th class="col-rank" rowspan="2">Разряд</th>
            <th class="col-region" rowspan="2">Субъект РФ</th>
            <th class="col-org" rowspan="2">Спортивная организация</th>
            ${stages.map((stage, idx) => `<th class="col-stage">${idx + 1} ЭКР</th>`).join('')}
            <th class="col-total" rowspan="2">Итог</th>
          </tr>
          <tr>
            ${stages.map((stage, idx) => {
              const stageTitle = stage.title || `Этап ${idx + 1}`;
              return `<td class="col-stage" style="font-size: 7pt; padding: 2px; text-align: center; border: 0.5px solid #000;">${stageTitle}</td>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>
  `;

  standings.forEach((row) => {
    const competitor = findCompetitorInStages(cup, row.ffr_id, row.competitorId);
    const name = row.name || getCompetitorName(competitor) || '—';
    const year = getCompetitorYear(competitor) || '—';
    const rank = getCompetitorRank(competitor) || '—';
    const region = row.region || getCompetitorRegion(competitor) || '—';
    const organization = getCompetitorOrganization(competitor) || '—';
    const ffrId = row.ffr_id || '—';
    const place = row.place || '—';
    const total = row.aggregate !== undefined && row.aggregate !== null ? Number(row.aggregate).toFixed(0) : '—';

    html += `
      <tr>
        <td class="col-place" style="text-align: center;">${place}</td>
        <td class="col-ffr" style="text-align: center;">${ffrId}</td>
        <td class="col-name">${name}</td>
        <td class="col-year" style="text-align: center;">${year}</td>
        <td class="col-rank" style="text-align: center;">${rank}</td>
        <td class="col-region">${region}</td>
        <td class="col-org">${organization}</td>
    `;

    stages.forEach((stage) => {
      const points = row.perStage && row.perStage[stage.id];
      const pointsStr = points !== undefined && points !== null ? Number(points).toFixed(0) : '';
      html += `<td class="col-stage" style="text-align: center;">${pointsStr}</td>`;
    });

    html += `
        <td class="col-total" style="text-align: center; font-weight: bold;">${total}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
      
      ${(() => {
        // Проверяем, заполнен ли главный секретарь
        if (!secretaryInfo.hasData) {
          return ''; // Не показываем блок подписей, если секретарь не заполнен
        }
        
        // Формируем ФИО секретаря
        const secretaryFullName = (() => {
          const parts = [];
          if (secretaryInfo.surName) parts.push(secretaryInfo.surName);
          if (secretaryInfo.name) {
            const nameParts = secretaryInfo.name.trim().split(/\s+/);
            const initials = nameParts.map(part => part.charAt(0).toUpperCase() + '.').join(' ');
            if (initials) parts.push(initials);
          }
          return parts.join(' ');
        })();
        
        return `
          <!-- Блок подписей -->
          <div class="signatures-block" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9pt; line-height: 1.4;">
            <div style="display: flex; flex-direction: column; gap: 40px;">
              <div>
                <div>Главный секретарь соревнований</div>
                <div style="margin-top: 4px;">${secretaryInfo.date || ''}</div>
              </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 200px;">
              <div style="width: 200px; height: 1px; background-color: #000; margin-bottom: 4px;"></div>
              <div style="font-size: 8pt;">(подпись)</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 40px; text-align: right;">
              <div>
                <div>${secretaryFullName}</div>
                <div style="margin-top: 4px; font-size: 8pt;">${secretaryInfo.category ? `(${secretaryInfo.category})` : '(расшифровка подписи)'}</div>
              </div>
            </div>
          </div>
        `;
      })()}
    </body>
    </html>
  `;

  return html;
};

export const saveCupPdf = async (cup) => {
  try {
    const html = generateCupPdfHtml(cup);
    const footerInfo = (() => {
      const firstStage = cup.stages && cup.stages[0];
      let date = '';
      let location = '';
      let codex = '';

      if (firstStage && firstStage.meta) {
        date = firstStage.meta.date || '';
        if (firstStage.meta.location) {
          location = firstStage.meta.location;
        } else if (firstStage.competitionSnapshot && firstStage.competitionSnapshot.mainData) {
          const mainData = firstStage.competitionSnapshot.mainData;
          if (mainData.location && mainData.location.value) {
            location = mainData.location.value;
          }
        }
      }

      if (cup.liveEventId) {
        codex = cup.liveEventId;
      } else if (firstStage && firstStage.competitionSnapshot && firstStage.competitionSnapshot.mainData) {
        const mainData = firstStage.competitionSnapshot.mainData;
        if (mainData.codex && mainData.codex.value) {
          codex = mainData.codex.value;
        }
      }

      return { date, location, codex };
    })();

    const options = {
      margin: [6, 6, 20, 6], // Увеличиваем нижний отступ для футера
      filename: `${cup.title || 'Cup'}_standings.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        letterRendering: true, 
        useCORS: true, 
        allowTaint: true,
        windowWidth: 1200,
        windowHeight: 800,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape',
        compress: true,
        pagebreak: { avoid: 'tr' },
      },
    };

    // Генерируем PDF через html2pdf
    const worker = html2pdf().set(options).from(html);
    
    // Пробуем получить PDF объект для добавления футера
    let pdf = null;
    let blob = null;
    
    try {
      // Генерируем PDF и получаем объект через промис
      pdf = await worker.toPdf().get('pdf');
      
      console.log('[CUPS PDF] PDF object received:', pdf ? 'valid' : 'null');
      console.log('[CUPS PDF] PDF type:', typeof pdf);
      
      // Если не получили, пробуем синхронный способ
      if (!pdf || !pdf.internal) {
        console.warn('[CUPS PDF] PDF object invalid, trying get(jsPDF)');
        pdf = worker.get('jsPDF');
        console.log('[CUPS PDF] PDF object via get(jsPDF):', pdf ? 'valid' : 'null');
      }
      
      console.log('[CUPS PDF] Final PDF object:', pdf ? 'valid' : 'null');
      console.log('[CUPS PDF] PDF has internal:', !!(pdf && pdf.internal));
      if (pdf && pdf.internal) {
        console.log('[CUPS PDF] PDF internal keys:', Object.keys(pdf.internal).slice(0, 10));
        console.log('[CUPS PDF] PDF has getNumberOfPages:', typeof pdf.internal.getNumberOfPages);
      }
      
      if (pdf && pdf.internal && typeof pdf.internal.getNumberOfPages === 'function') {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 6;
        const footerBottomMargin = 6;
        const footerHeight = 15;

        console.log('[CUPS PDF] Adding footer to', totalPages, 'pages');
        console.log('[CUPS PDF] Page size:', pageWidth, 'x', pageHeight);

        // Создаем элемент для футера один раз
        const footerContainer = document.createElement('div');
        footerContainer.id = 'cup-footer-container';
        footerContainer.style.cssText = 'position: fixed; left: -9999px; top: 0; width: 285mm; background: white; font-family: Arial, sans-serif; font-size: 9pt; color: #000; padding: 3px 8px;';
        document.body.appendChild(footerContainer);

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          const currentPageHeight = pdf.internal.pageSize.getHeight();
          const currentPageWidth = pdf.internal.pageSize.getWidth();
          const currentFooterTopY = currentPageHeight - footerBottomMargin - footerHeight;
          const currentFooterBottomY = currentPageHeight - footerBottomMargin;
          
          console.log(`[CUPS PDF] Processing page ${i}, footer Y: ${currentFooterTopY} to ${currentFooterBottomY}`);
          
          // Рисуем границы футера
          pdf.setDrawColor(0, 0, 0);
          pdf.setLineWidth(0.5);
          pdf.line(margin, currentFooterTopY, currentPageWidth - margin, currentFooterTopY);
          pdf.line(margin, currentFooterBottomY, currentPageWidth - margin, currentFooterBottomY);

          // Обновляем содержимое футера
          footerContainer.innerHTML = `
            <div style="border-top: 0.5px solid #000; border-bottom: 0.5px solid #000; padding: 2px 0;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <div>${footerInfo.date || ''}</div>
                  <div>ФЕДЕРАЦИЯ ФРИСТАЙЛА РОССИИ</div>
                  <div>www.timingweb.com</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 2px; text-align: right;">
                  <div>Страница: ${i} / ${totalPages}</div>
                  <div>www.ffr-ski.ru</div>
                  <div>Timing/Scoring & data processing by TimingWeb</div>
                </div>
              </div>
            </div>
          `;

          // Ждем рендеринга
          await new Promise(resolve => {
            requestAnimationFrame(() => {
              setTimeout(resolve, 50);
            });
          });

          try {
            const html2canvas = require('html2canvas');
            console.log(`[CUPS PDF] Rendering footer for page ${i}...`);
            
            const canvas = await html2canvas(footerContainer, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              logging: false,
              width: footerContainer.offsetWidth || 285 * 3.779527559, // mm to px
              height: footerContainer.offsetHeight || 50,
            });
            
            console.log(`[CUPS PDF] Canvas created for page ${i}:`, canvas.width, 'x', canvas.height);
            
            if (canvas && canvas.width > 0 && canvas.height > 0) {
              const imgData = canvas.toDataURL('image/png');
              const imgWidth = currentPageWidth - 2 * margin;
              const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, footerHeight);
              
              console.log(`[CUPS PDF] Adding image to page ${i}, size:`, imgWidth, 'x', imgHeight, 'at Y:', currentFooterTopY);
              pdf.addImage(imgData, 'PNG', margin, currentFooterTopY, imgWidth, imgHeight);
              console.log(`[CUPS PDF] Footer image added to page ${i}`);
            } else {
              console.warn(`[CUPS PDF] Canvas is empty for page ${i}`);
            }
          } catch (canvasErr) {
            console.error(`[CUPS PDF] Error rendering footer for page ${i}:`, canvasErr);
            console.error('[CUPS PDF] Error details:', canvasErr.message, canvasErr.stack);
          }
        }
        
        // Удаляем элемент
        if (footerContainer.parentNode) {
          document.body.removeChild(footerContainer);
        }
        
        console.log('[CUPS PDF] Footer processing completed, generating blob...');
        blob = pdf.output('blob');
        console.log('[CUPS PDF] Blob generated, size:', blob ? blob.size : 'null');
      } else {
        console.error('[CUPS PDF] Invalid PDF object');
        console.error('[CUPS PDF] pdf:', pdf);
        console.error('[CUPS PDF] pdf.internal:', pdf && pdf.internal);
        console.error('[CUPS PDF] getNumberOfPages:', pdf && pdf.internal && typeof pdf.internal.getNumberOfPages);
        blob = await worker.outputPdf('blob');
      }
    } catch (err) {
      console.error('[CUPS PDF] Error generating PDF:', err);
      try {
        blob = await worker.outputPdf('blob');
      } catch (err2) {
        console.error('[CUPS PDF] Error in fallback:', err2);
        throw err;
      }
    }
    
    // Сохраняем PDF
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${cup.title || 'Cup'}_standings.pdf`;
    link.click();
  } catch (error) {
    console.error('[CUPS PDF] Error saving PDF:', error);
    throw error;
  }
};

export const printCup = (cup) => {
  try {
    const html = generateCupPdfHtml(cup);
    const { ipcRenderer } = require('electron');
    ipcRenderer.send('print-protocol-html', {
      html,
      title: `${cup.title || 'Cup'} - Standings`,
    });
  } catch (error) {
    console.error('[CUPS PDF] Error printing:', error);
    throw error;
  }
};

