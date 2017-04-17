var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var messageModel = require('./message');

var port = process.env.PORT || 5000;
app.use(express.static(path.join(__dirname)));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../chat-application', 'index.html'))
});

var usernames = {};
var rooms = ['general', 'nyc', 'sf'];

function saveMessage(room, msg, username, time) {
  messageModel.message.create({
              room: room,
              message : msg,
              author  : username,
              date    : time
          }, function (err, rs) {
              console.log(err);
          });
};

function loadMessages(currentRoom, channel) {
  console.log(currentRoom);
  messageModel.message.find({room: currentRoom}).limit(10).sort({_id: -1}).exec(function (err, results) {
        results.reverse();
        results.forEach(function (message) {
            channel.emit('chat message', message.author, message.message, message.date);
            console.log(message);
        });
    });
}

io.on('connection', function(socket) {

  socket.on('send message', function(from, msg, time) {
    io.sockets.in(socket.room).emit('chat message', socket.username, msg, time);
    saveMessage(socket.room, msg, socket.username, time);
  });

  socket.on('adduser', function(username) {
    username = username.toLowerCase();
    socket.username = username;
    usernames[username] = username;

    socket.room = 'general';
    socket.join('general');

    socket.emit('chat message', 'SERVER', `you have connected to ${'general'}`, new Date().toLocaleString(), username);
    socket.broadcast.to('general').emit('chat message', 'SERVER', `${username} has connected to this room`, new Date().toLocaleString());

    io.emit('update-users-list', usernames);
    socket.emit('updateroom', rooms, 'general');
    loadMessages(socket.room, socket);
  });

  socket.on('switchroom', function(newRoom) {
    socket.leave(socket.room);
    socket.join(newRoom);
    socket.emit('chat message', 'SERVER', `you have connected to ${newRoom}`, new Date().toLocaleString(), 'switchroom');
    socket.broadcast.to(socket.room).emit('chat message', 'SERVER', `${socket.username} has left this room`, new Date().toLocaleString())
    socket.room = newRoom;
    loadMessages(socket.room, io.sockets.in(socket.room));
    socket.broadcast.to(newRoom).emit('chat message', 'SERVER', `${socket.username} has joined this room`, new Date().toLocaleString())
    socket.emit('updateroom', rooms, newRoom);
  });

  socket.on('notify user', function(user) {
    io.emit('notify user', user)
  });

  socket.on('disconnect', function() {
    delete usernames[socket.username];
    io.emit('update-users-list', usernames);
    socket.broadcast.to(socket.room).emit('chat message', 'SERVER', `${socket.username} has disconnected`, new Date().toLocaleString())
    socket.leave(socket.room);
  });
});


http.listen(port, function() {
  console.log("listening on 5000");
});
