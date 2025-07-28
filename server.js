const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    const { type, room, payload } = data;

    if (type === 'join') {
      ws.room = room;
      rooms[room] = rooms[room] || [];
      rooms[room].push(ws);
      return;
    }

    if (type === 'sync') {
      rooms[room]?.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'sync', payload }));
        }
      });
    }
  });

  ws.on('close', () => {
    if (ws.room) {
      rooms[ws.room] = rooms[ws.room].filter(client => client !== ws);
      if (rooms[ws.room].length === 0) delete rooms[ws.room];
    }
  });
});

app.use(express.static(path.join(__dirname, 'client', 'dist')));

server.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port 3000');
});
