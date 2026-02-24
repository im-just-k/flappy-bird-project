const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.post('/flap', (req, res) => {
  io.emit('flap'); // broadcast to all clients
  res.sendStatus(200);
});

server.listen(3001, () => console.log("Server running on port 3001"));