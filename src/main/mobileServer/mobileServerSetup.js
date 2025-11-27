import { ipcMain, mainWindow } from '../index';
import { sendServerMessage } from '../index';
import http from 'http';
import path from 'path';
import fs from 'fs';
import os from 'os';
import url from 'url';

let mobileServer = null;
let mobileServerRunning = false;
let mobileServerPort = 8080;
let splitData = {}; // Хранилищьуе данных для каждого сплита

// Получение локального IP адреса
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  const preferredIps = []; // Приоритетные IP (локальные сети)
  const otherIps = []; // Остальные IP

  for (const name of Object.keys(interfaces)) {
    // Пропускаем виртуальные интерфейсы (VMware, VirtualBox и т.д.)
    if (
      name.toLowerCase().includes('virtual') ||
      name.toLowerCase().includes('vmware') ||
      name.toLowerCase().includes('virtualbox') ||
      name.toLowerCase().includes('vbox') ||
      name.toLowerCase().includes('hyper-v')
    ) {
      continue;
    }

    for (const iface of interfaces[name]) {
      // Пропускаем внутренние и не-IPv4 адреса
      if (iface.family === 'IPv4' && !iface.internal) {
        const ip = iface.address;

        // Пропускаем link-local адреса (169.254.x.x)
        if (ip.startsWith('169.254.')) {
          continue;
        }

        // Приоритет: локальные сети (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        if (ip.startsWith('192.168.') || ip.startsWith('10.') || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) {
          preferredIps.push(ip);
        } else {
          otherIps.push(ip);
        }
      }
    }
  }

  // Возвращаем первый приоритетный IP, если есть
  if (preferredIps.length > 0) {
    return preferredIps[0];
  }

  // Иначе возвращаем первый не-приоритетный IP
  if (otherIps.length > 0) {
    return otherIps[0];
  }

  return '127.0.0.1';
}

// HTML шаблон для мобильного интерфейса
function getMobileHTML(splitId, splitTitle) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${splitTitle} - TimingWeb</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #ffffff;
      color: #000000;
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
    .header {
      background-color: #ffffff;
      padding: 16px;
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #000000;
      border-bottom: 1px solid #e0e0e0;
    }
    .times-list {
      flex: 1;
      overflow-y: auto;
      background-color: #f5f5f5;
      padding: 0;
      min-height: 0;
      padding-bottom: 420px; /* Отступ для фиксированной последней отсечки, чтобы последние отсечки не опускались ниже фиксированной (400px bottom + 20px запас) */
    }
    .time-item {
      background-color: #ffffff;
      padding: 16px;
      margin-bottom: 1px;
      border-bottom: 1px solid #e0e0e0;
      font-family: 'Roboto Mono', monospace;
      font-size: 18px;
      display: flex;
      align-items: center;
      gap: 16px;
      min-height: 60px;
      transition: background-color 0.2s;
    }
    .time-item.editing {
      background-color: #e8f5e9;
      border-left: 4px solid #27c46b;
    }
    .time-item.last-entry {
      position: fixed;
      bottom: 400px; /* Над кнопкой "1" (80px) + клавиатура (240px) + отступ (80px) */
      left: 0;
      right: 0;
      z-index: 5;
      background-color: #e8f5e9;
      border-left: 4px solid #27c46b;
      border-top: 2px solid #27c46b;
      border-bottom: 2px solid #27c46b;
      padding: 20px;
      min-height: 80px;
      font-size: 22px;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
      margin: 0;
    }
    
    /* Граница, за которую отсечки не должны опускаться */
    .times-list::after {
      content: '';
      display: block;
      height: 1px;
      background-color: transparent;
      margin-top: auto;
    }
    .time-item.last-entry .channel {
      font-size: 24px;
      min-width: 50px;
    }
    .time-item.last-entry .time {
      font-size: 22px;
      font-weight: bold;
    }
    .time-item.last-entry .bib-input {
      width: 150px;
      padding: 12px 16px;
      font-size: 22px;
      border-width: 3px;
    }
    .time-item .channel {
      color: #5ab4ff;
      font-weight: bold;
      min-width: 40px;
      font-size: 18px;
    }
    .time-item .time {
      flex: 1;
      color: #000000;
      font-size: 18px;
      font-weight: bold;
    }
    .time-item .bib-input {
      width: 120px;
      padding: 10px 12px;
      background-color: #ffffff;
      border: 2px solid #5ab4ff;
      border-radius: 4px;
      color: #000000;
      font-size: 18px;
      text-align: center;
      font-weight: bold;
      font-family: inherit;
    }
    .time-item.editing .bib-input {
      border-color: #27c46b;
      background-color: #f0f8ff;
    }
    .controls {
      background-color: #ffffff;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      border-top: 1px solid #e0e0e0;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
    }
    .channel-button {
      width: 100%;
      height: 80px;
      background-color: #27c46b;
      border: none;
      border-radius: 8px;
      color: #ffffff;
      font-size: 32px;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    .channel-button:active {
      opacity: 0.7;
    }
    .keypad {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .keypad-button {
      height: 60px;
      background-color: #3d3d3d;
      border: none;
      border-radius: 4px;
      color: #ffffff;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .keypad-button:active {
      background-color: #4d4d4d;
    }
    .keypad-button.clear {
      background-color: #ff5b6b;
    }
    .keypad-button.confirm {
      background-color: #27c46b;
    }
    
    /* Отступ уже добавлен выше в .tt */
    
    /* Улучшаем визуальное отображение пустого состояния */
    .times-list > div:only-child {
      padding: 40px 16px;
      text-align: center;
      color: #999;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <div class="header">${splitTitle}</div>
  <div class="times-list" id="timesList">
    <div style="padding: 16px; text-align: center; color: #999;">Нет отсечек</div>
  </div>
  <div class="controls">
    <button class="channel-button" id="channelButton">1</button>
    <div class="keypad">
      <button class="keypad-button" data-value="1">1</button>
      <button class="keypad-button" data-value="2">2</button>
      <button class="keypad-button" data-value="3">3</button>
      <button class="keypad-button" data-value="4">4</button>
      <button class="keypad-button" data-value="5">5</button>
      <button class="keypad-button" data-value="6">6</button>
      <button class="keypad-button" data-value="7">7</button>
      <button class="keypad-button" data-value="8">8</button>
      <button class="keypad-button" data-value="9">9</button>
      <button class="keypad-button clear" data-value="clear">X</button>
      <button class="keypad-button" data-value="0">0</button>
      <button class="keypad-button confirm" data-value="confirm">✓</button>
    </div>
  </div>
  <script>
    const splitId = '${splitId}';
    const timesList = document.getElementById('timesList');
    const channelButton = document.getElementById('channelButton');
    let currentChannel = 1;
    let editingEntryId = null;
    let entries = [];
    let userScrolled = false; // Флаг, что пользователь недавно прокручивал список
    let scrollResetTimer = null;
    let latestRenderedEntryKey = null;

    // Хранилище значений ввода для каждого поля
    let inputValues = {};
    
    function convertTimeStringToMs(timeString) {
      if (!timeString) return 0;
      const normalized = timeString.toString().trim().replace(',', '.');
      if (!normalized) return 0;
      const parseSeconds = (value) => {
        const secondsParts = value.split(/[.,]/);
        const seconds = parseInt(secondsParts[0], 10) || 0;
        const milliseconds = parseInt((secondsParts[1] || '0').padEnd(3, '0').slice(0, 3), 10) || 0;
        return { seconds, milliseconds };
      };
      const parts = normalized.split(':');
      let hours = 0;
      let minutes = 0;
      let seconds = 0;
      let milliseconds = 0;
      if (parts.length === 3) {
        hours = parseInt(parts[0], 10) || 0;
        minutes = parseInt(parts[1], 10) || 0;
        const parsed = parseSeconds(parts[2]);
        seconds = parsed.seconds;
        milliseconds = parsed.milliseconds;
      } else if (parts.length === 2) {
        minutes = parseInt(parts[0], 10) || 0;
        const parsed = parseSeconds(parts[1]);
        seconds = parsed.seconds;
        milliseconds = parsed.milliseconds;
      } else {
        const parsed = parseSeconds(normalized);
        seconds = parsed.seconds;
        milliseconds = parsed.milliseconds;
      }
      return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
    }

    function getEntrySortValue(entry) {
      if (!entry) return 0;
      if (typeof entry.capturedAt === 'number' && entry.capturedAt > 0) {
        return entry.capturedAt;
      }
      const sourceTime = entry.time || entry.rawTime || entry.displayTime || entry.originalRawTime;
      return convertTimeStringToMs(sourceTime);
    }

    // Отслеживаем прокрутку пользователем
    timesList.addEventListener('scroll', () => {
      userScrolled = true;
      if (scrollResetTimer) {
        clearTimeout(scrollResetTimer);
      }
      scrollResetTimer = setTimeout(() => {
        userScrolled = false;
      }, 1500);
    });
    
    // Обновление списка отсечек
    function updateTimesList(newEntries) {
      const previousScroll = timesList.scrollTop;
      // Сохраняем текущие значения ввода перед обновлением
      document.querySelectorAll('.bib-input').forEach(input => {
        const entryId = input.dataset.entryId;
        if (entryId && input.value) {
          inputValues[entryId] = input.value;
        }
      });
      
      timesList.innerHTML = '';
      if (!newEntries || !Array.isArray(newEntries) || newEntries.length === 0) {
        timesList.innerHTML = '<div style="padding: 16px; text-align: center; color: #666;">Нет отсечек</div>';
        entries = [];
        inputValues = {};
        return;
      }
      
      entries = Array.isArray(newEntries) ? newEntries.slice() : [];
      entries.sort((a, b) => getEntrySortValue(b) - getEntrySortValue(a));
      const firstEntry = entries[0];
      const newestEntryKey = firstEntry
        ? (firstEntry.id
            ? firstEntry.id.toString()
            : ((firstEntry.channel || '') + '-' + (firstEntry.time || firstEntry.rawTime || firstEntry.displayTime || '')))
        : null;
      const hasNewEntry = newestEntryKey && newestEntryKey !== latestRenderedEntryKey;
      if (newestEntryKey) {
        latestRenderedEntryKey = newestEntryKey;
      }
      
      // Находим первую отсечку БЕЗ номера (самую новую без номера)
      let lastEntryWithoutBib = null;
      for (let i = 0; i < entries.length; i++) {
        if (!entries[i].bib || entries[i].bib === '') {
          lastEntryWithoutBib = entries[i];
          break;
        }
      }
      
      const lastEntryWithoutBibId = lastEntryWithoutBib ? (lastEntryWithoutBib.id || entries.indexOf(lastEntryWithoutBib).toString()) : null;
      
      // Удаляем старую фиксированную отсечку, если есть
      const oldLastEntry = document.querySelector('.time-item.last-entry');
      if (oldLastEntry) {
        oldLastEntry.remove();
      }
      
      // Автоматически активируем первую отсечку без номера
      if (lastEntryWithoutBib) {
        editingEntryId = lastEntryWithoutBibId;
      } else if (editingEntryId) {
        // Если нет отсечек без номера, но есть редактируемая - оставляем её
        // Иначе сбрасываем только если редактируемая отсечка больше не существует
        const stillExists = entries.some(e => {
          const eId = e.id || entries.indexOf(e).toString();
          return eId === editingEntryId;
        });
        if (!stillExists) {
          editingEntryId = null;
        }
      }
      
      entries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'time-item';
        const entryId = entry.id || index;
        item.dataset.entryId = entryId;
        
        // Проверяем, является ли это последней отсечкой без номера
        const isLastWithoutBib = entry === lastEntryWithoutBib;
        const isEditing = editingEntryId === entryId.toString();
        
        // Используем сохраненное значение или значение из entry
        const currentValue = inputValues[entryId] !== undefined ? inputValues[entryId] : (entry.bib || '');
        
        if (isLastWithoutBib) {
          // Последняя отсечка без номера - фиксируем над кнопкой "1"
          item.classList.add('editing', 'last-entry');
          item.innerHTML = \`
            <span class="channel">\${entry.channel || ''}</span>
            <span class="time">\${entry.time || ''}</span>
            <input type="text" class="bib-input" 
                   value="\${currentValue}" 
                   placeholder="Номер" 
                   maxlength="10"
                   data-entry-id="\${entryId}"
                   readonly
                   inputmode="none"
                   autocomplete="off" />
          \`;
          // Добавляем фиксированную отсечку в конец body, чтобы она была поверх всего
          document.body.appendChild(item);
        } else if (isEditing) {
          // Редактируемая отсечка (не последняя без номера, но выбранная для редактирования)
          item.classList.add('editing');
          item.innerHTML = \`
            <span class="channel">\${entry.channel || ''}</span>
            <span class="time">\${entry.time || ''}</span>
            <input type="text" class="bib-input" 
                   value="\${currentValue}" 
                   placeholder="Номер" 
                   maxlength="10"
                   data-entry-id="\${entryId}"
                   readonly
                   inputmode="none"
                   autocomplete="off" />
          \`;
          timesList.appendChild(item);
        } else {
          // Обычная отсечка (с номером или без, но не редактируемая)
          item.innerHTML = \`
            <span class="channel">\${entry.channel || ''}</span>
            <span class="time">\${entry.time || ''}</span>
            <span style="min-width: 80px; text-align: center;">\${entry.bib || ''}</span>
          \`;
          timesList.appendChild(item);
        }
        
        // Клик по отсечке для редактирования (можно редактировать любую отсечку, кроме фиксированной последней)
        if (!isLastWithoutBib) {
          item.style.cursor = 'pointer';
          item.addEventListener('click', () => {
            editingEntryId = entryId.toString();
            updateTimesList(entries);
          });
        }
      });
      
      requestAnimationFrame(() => {
        const maxScroll = Math.max(timesList.scrollHeight - timesList.clientHeight, 0);
        if (userScrolled) {
          timesList.scrollTop = Math.min(previousScroll, maxScroll);
        } else if (hasNewEntry) {
          timesList.scrollTop = 0;
        }
      });
    }

    // Обновление канала
    function updateChannel(channel) {
      currentChannel = channel;
      channelButton.textContent = channel;
    }

    // Обработка клавиатуры
    document.querySelectorAll('.keypad-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        // Ищем активное поле ввода - сначала в фиксированной отсечке, потом в списке
        let activeInput = document.querySelector('.time-item.last-entry .bib-input');
        if (!activeInput) {
          activeInput = document.querySelector('.time-item.editing .bib-input');
        }
        
        if (!activeInput) {
          // Если нет активного поля, ищем последнюю отсечку без номера
          const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
          if (lastEntry && !lastEntry.bib) {
            // Обновляем список, чтобы активировать последнюю отсечку
            editingEntryId = lastEntry.id || (entries.length - 1).toString();
            updateTimesList(entries);
            return;
          }
          return;
        }
        
        const entryId = activeInput.dataset.entryId;
        
        if (value === 'clear') {
          activeInput.value = '';
          inputValues[entryId] = '';
        } else if (value === 'confirm') {
          const bib = activeInput.value.trim();
          if (bib) {
            // Отправка номера для существующей отсечки
            fetch('/api/split/' + splitId + '/create-split', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bib: bib, channel: currentChannel, entryId: entryId })
            });
            editingEntryId = null;
            delete inputValues[entryId];
          } else {
            // Пропускаем ввод номера, просто переходим к следующей отсечке
            editingEntryId = null;
            delete inputValues[entryId];
            updateTimesList(entries);
          }
        } else {
          const newValue = activeInput.value + value;
          activeInput.value = newValue;
          inputValues[entryId] = newValue;
        }
      });
    });

    // Предотвращаем появление клавиатуры при клике на поле
    timesList.addEventListener('touchstart', (e) => {
      if (e.target.classList.contains('bib-input')) {
        e.preventDefault();
      }
    }, { passive: false });
    
    timesList.addEventListener('click', (e) => {
      if (e.target.classList.contains('bib-input')) {
        e.preventDefault();
      }
    });

    // Создание отсечки по кнопке канала (кнопка "1")
    channelButton.addEventListener('click', () => {
      // Создаем новую отсечку с текущим временем ПК
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
      const timeString = \`\${hours}:\${minutes}:\${seconds}.\${milliseconds}\`;
      
      fetch('/api/split/' + splitId + '/create-split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: currentChannel, time: timeString, createNew: true })
      });
    });

    // Polling для обновления данных
    function pollData() {
      fetch('/api/split/' + splitId + '/data')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.entries)) updateTimesList(data.entries);
          if (data && data.channel) updateChannel(data.channel);
        })
        .catch(err => console.error('[MOBILE] Error fetching split data:', err));
    }

    // Обновление каждые 500мс
    setInterval(pollData, 500);
    pollData();
  </script>
</body>
</html>`;
}

// Создание HTTP сервера
function createMobileServer(port = 8080) {
  if (mobileServerRunning) {
    return mobileServer;
  }

  mobileServer = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Главная страница мобильного интерфейса
    if (parsedUrl.pathname && parsedUrl.pathname.startsWith('/mobile/')) {
      const splitId = parsedUrl.pathname.split('/mobile/')[1];
      const splitData = getSplitData(splitId);
      if (splitData) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(getMobileHTML(splitId, splitData.title || 'SPLIT'));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Split not found');
      }
      return;
    }

    // API для получения данных сплита
    if (parsedUrl.pathname && parsedUrl.pathname.startsWith('/api/split/') && parsedUrl.pathname.endsWith('/data')) {
      const splitId = parsedUrl.pathname.split('/api/split/')[1].split('/data')[0];
      const splitData = getSplitData(splitId);
      if (splitData) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            entries: splitData.entries || [],
            channel: splitData.channel || 1,
          })
        );
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Split not found' }));
      }
      return;
    }

    // API для создания отсечки
    if (parsedUrl.pathname && parsedUrl.pathname.startsWith('/api/split/') && parsedUrl.pathname.endsWith('/create-split')) {
      const splitId = parsedUrl.pathname.split('/api/split/')[1].split('/create-split')[0];
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          // Отправляем событие в главное окно для создания/обновления отсечки
          if (mainWindow) {
            mainWindow.webContents.send('mobile-create-split', {
              splitId,
              ...data,
            });
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // 404 для всех остальных запросов
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  });

  mobileServer.listen(port, '0.0.0.0', () => {
    mobileServerRunning = true;
    mobileServerPort = port;
    const localIp = getLocalIp();

    // Логируем все сетевые интерфейсы для отладки
    const interfaces = os.networkInterfaces();
    const allIps = [];
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          allIps.push(`${name}: ${iface.address}`);
        }
      }
    }

    sendServerMessage({
      color: 'blue',
      message: `Mobile server started on http://${localIp}:${port}`,
    });
    sendServerMessage({
      color: 'white',
      message: `Available network interfaces: ${allIps.join(', ')}`,
    });

    if (mainWindow) {
      mainWindow.webContents.send('mobile-server-started', {
        ip: localIp,
        port: port,
      });
    }
  });

  mobileServer.on('error', (err) => {
    sendServerMessage({
      color: 'red',
      message: `Mobile server error: ${err.message}`,
    });
  });

  return mobileServer;
}

// Остановка сервера
function stopMobileServer() {
  if (mobileServer && mobileServerRunning) {
    mobileServer.close(() => {
      mobileServerRunning = false;
      sendServerMessage({
        color: 'blue',
        message: 'Mobile server stopped',
      });
      if (mainWindow) {
        mainWindow.webContents.send('mobile-server-stopped');
      }
    });
  }
}

// Управление данными сплитов
function setSplitData(splitId, data) {
  splitData[splitId] = data;
}

function getSplitData(splitId) {
  return splitData[splitId] || null;
}

function updateSplitEntries(splitId, entries) {
  if (splitData[splitId]) {
    splitData[splitId].entries = entries;
  }
}

// IPC обработчики
ipcMain.on('start-mobile-server', (event, { splitId, port = 8080 }) => {
  if (!mobileServerRunning) {
    createMobileServer(port);
  }
  // Устанавливаем данные для сплита
  if (splitId) {
    setSplitData(splitId, {
      id: splitId,
      title: 'SPLIT',
      entries: [],
      channel: 1,
    });
  }
});

ipcMain.on('stop-mobile-server', () => {
  stopMobileServer();
});

ipcMain.on('update-mobile-split-data', (event, { splitId, title, entries, channel }) => {
  setSplitData(splitId, {
    id: splitId,
    title: title || 'SPLIT',
    entries: entries || [],
    channel: channel || 1,
  });
});

ipcMain.on('get-local-ip', (event) => {
  event.returnValue = getLocalIp();
});

export { createMobileServer, stopMobileServer, setSplitData, getSplitData, updateSplitEntries };
