var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var port = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname)));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../chat-application', 'index.html'))
});

var usernames = {};
var rooms = ['general', 'nyc', 'sf'];

io.on('connection', function(socket) {
  // form = socket.username;
  socket.on('send message', function(from, msg, time) {
    console.log(io.sockets.adapter.rooms );
    io.sockets.in(socket.room).emit('chat message', socket.username, msg, time)
  })

  socket.on('adduser', function(username) {
    socket.username = username;
    usernames[username] = username;

    socket.room = rooms[0];
    socket.join(rooms[0]);

    socket.emit('chat message', 'SERVER', `you have connected to ${rooms[0]}`, new Date().toLocaleString(),username);
    socket.broadcast.to(rooms[0]).emit('chat message','SERVER', `${username} has connected to this room`);

    // io.emit('update-users-list', usernames)
    socket.emit('updateroom', rooms, rooms[0]);
  });

  socket.on('switchroom', function(newRoom) {
    socket.leave(newRoom);
    socket.join(newRoom);
    socket.emit('chat message', 'SERVER', `you have connected to ${newRoom}`)
    socket.broadcast.to(socket.room).emit('chat message', 'SERVER', `${socket.username} has left this room`)
    socket.room = newRoom;
    socket.broadcast.to(newRoom).emit('chat message', 'SERVER', `${socket.username} has joined this room`)
  });

  socket.on('notify user', function(user) {
    io.emit('notify user', user)
  });

  socket.on('disconnect', function() {
    delete usernames[socket.username];
    io.emit('update-users-list', usernames);
    io.emit('chat message', 'SERVER', `${socket.username} has disconnected`, new Date().toLocaleString())
  });
});


http.listen(port, function() {
  console.log("listening on 5000")
});
