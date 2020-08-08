'use strict';
const server = require('http').createServer();
const ioServer = require('socket.io')(server);
ioServer.sockets.on('connection', function (socket) {
  console.log('user connected', socket.id);
  socket.emit('sessionID', socket.id);
  function log(...message) {
    const array = ['Message from server:'];
    array.push.apply(array, message);
    socket.emit('log', array);
  }
  socket.on('message', function (message) {
    log('Client said: ', message);
    if (message.sendTo === undefined) {
      socket.to(message.room).emit('message', message);
    } else {
      ioServer.to(message.sendTo).emit('message', message);
    }
  });
  socket.on('create or join', function (room) {
    log('Received request to create or join room' + room);
    const clientsInRoom = ioServer.sockets.adapter.rooms[room];
    const numClients = clientsInRoom
      ? Object.keys(clientsInRoom.sockets).length
      : 0;
    log(`${room} now has ${numClients + 1} client(s)`);
    if (numClients === 0) {
      socket.join(room);
      log(`${socket.id} created ${room}`);
      socket.emit('created', room, socket.id);
    } else {
      socket.join(room);
      log(`${socket.id} joined ${room}`);
      ioServer.sockets
        .in(room)
        .emit('joined', room, socket.id, ioServer.sockets.adapter.rooms[room]);
    }
  });
});
console.log('start listening');
server.listen(3000);
