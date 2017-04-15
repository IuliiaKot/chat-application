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

io.on('connection', function(socket) {

  socket.on('send message', function(from, msg, time) {
    io.sockets.in(socket.room).emit('chat message', socket.username, msg, time);
    messageModel.message.create({
                room: socket.room,
                message : msg,
                author: socket.username,
                date    : time
            }, function (err, rs) {
                console.log(err);
            });
  });

  socket.on('adduser', function(username) {
    socket.username = username;
    usernames[username] = username;

    socket.room = 'general';
    socket.join('general');

    socket.emit('chat message', 'SERVER', `you have connected to ${'general'}`, new Date().toLocaleString(), username);
    socket.broadcast.to('general').emit('chat message','SERVER', `${username} has connected to this room`);

    io.emit('update-users-list', usernames);
    socket.emit('updateroom', rooms, 'general');

    messageModel.message.find().limit(10).sort({_id: -1}).exec(function (err, results) {
          results.reverse();
          results.forEach(function (message) {
              // client.emit('addMessage', message.nickname, message);
              io.sockets.in('general').emit('chat message', message.author, message.message, message.date);
              // console.log(message);
          });
      });
  });

  socket.on('switchroom', function(newRoom) {
    socket.leave(socket.room);
    socket.join(newRoom);
    socket.emit('chat message', 'SERVER', `you have connected to ${newRoom}`)
    socket.broadcast.to(socket.room).emit('chat message', 'SERVER', `${socket.username} has left this room`)
    socket.room = newRoom;
    socket.broadcast.to(newRoom).emit('chat message', 'SERVER', `${socket.username} has joined this room`)
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
