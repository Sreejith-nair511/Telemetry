const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

console.log('--- ASCEND Telemetry Relay Server ---');
console.log('Listening on ws://localhost:8080');

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (data) => {
    // Broadcast incoming data to all OTHER clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(data.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
