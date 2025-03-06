export const protocolHandlers = {
  'protocol:page': (dataCtx) => {
    return [dataCtx.page || ''];
  },
  'protocol:pages-total': (dataCtx) => {
    return [dataCtx.totalPages || ''];
  },
  'protocol:created-date': () => {
    const date = new Date().toLocaleTimeString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return [date || ''];
  },
};
