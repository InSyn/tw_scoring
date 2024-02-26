const serverSetup = {
  udpServer: null,
  isServerRunning: false,
  clientTimeout: 150000,
  clientsConnectionCheckerId: null,
};

const clients = new Map();

export { serverSetup, clients };
