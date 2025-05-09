let wssInstance = null;
const WebSocket = require('ws');

function setupWebSocketServer(server) {
  if (wssInstance) return wssInstance;
  wssInstance = new WebSocket.Server({ server });

  wssInstance.on('connection', function connection(ws) {
    console.log('A new client connected');

    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
      ws.send(`Server received: ${message}`);
    });

    ws.on('close', function close() {
      console.log('Client disconnected');
    });

    ws.send('Welcome to the WebSocket server!');
  });

  console.log('WebSocket server attached to existing HTTP server');
  return wssInstance;
}

function getWssInstance() {
  return wssInstance;
}

module.exports = setupWebSocketServer;
module.exports.getWssInstance = getWssInstance;
