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
  var time = new Date().toLocaleString();

  socket.on('send message', function(from, msg, time) {
    io.sockets.in(socket.room).emit('chat message', socket.username, msg, time);
    saveMessage(socket.room, msg, socket.username, time);
  });

  socket.on('adduser', function(username) {
    username = username.toLowerCase();
    console.log(users);
    socket.username = username;
    usernames[username] = socket.id;

    socket.room = 'general';
    socket.join('general');

    socket.emit('chat message', 'SERVER', `you have connected to ${'general'}`, time, username);
    socket.broadcast.to('general').emit('chat message', 'SERVER', `${username} has connected to this room`, time);

    io.emit('update-users-list', usernames, username);
    socket.emit('updateroom', rooms, 'general');
    loadMessages(socket.room, socket);

  });

  socket.on('switchroom', function(newRoom) {
    socket.leave(socket.room);
    socket.join(newRoom);
    socket.emit('chat message', 'SERVER', `you have connected to ${newRoom}`, new Date().toLocaleString(), 'switchroom');
    socket.broadcast.to(socket.room).emit('chat message', 'SERVER', `${socket.username} has left this room`, time)
    socket.room = newRoom;
    loadMessages(socket.room, socket.broadcast.to(socket.room));
    socket.broadcast.to(newRoom).emit('chat message', 'SERVER', `${socket.username} has joined this room`, time)
    socket.emit('updateroom', rooms, newRoom);
  });


  socket.on('initiate private message', function(userFrom, userTo) {
    var receiverSocketId = userTo;
    var receiverName = findUser(userTo);
    var room = getARoom(findUser(socket.id, receiverName));
    socket.join(room);
    socket.room = room;
    // socket[receiverSocketId].join(room);
    io.sockets.in(room).emit('private room created', 'private room was created');
    // socket.broadcast.to(socket.room).emit('private')
    console.log(receiverSocketId);
    console.log(receiverName);
    console.log(room)
    // console.log(io.sockets.connected[receiverSocketId]);
  });

  socket.on('send private message', function(id, message) {
    socket.broadcast.to(id).emit('private chat created', message);
});

  socket.on('notify user', function(user) {
    io.emit('notify user', user)
  });

  socket.on('disconnect', function() {
    delete usernames[socket.username];
    io.emit('update-users-list', usernames);
    socket.broadcast.to(socket.room).emit('chat message', 'SERVER', `${socket.username} has disconnected`, time)
    socket.leave(socket.room);
  });
});


function findUser(id) {
  for (name in usernames) {
    if (usernames[name] == id) {
      return name;
    }
  }
};

function getARoom(user1, user2) {
  return 'privateRooom' + user1 + "And" + user2;
}

http.listen(port, function() {
  console.log("listening on 5000");
});
