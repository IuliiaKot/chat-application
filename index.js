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

io.on('connection', function(socket) {
  socket.on('chat message', function(from, msg, time){
    console.log('1')
    console.log(from)
    io.emit('chat message', from, msg, time)
  })

  socket.on('notify user', function(user){
    io.emit('notify user', user)
  })

  socket.on('disconnect', function(username){
    io.emit('disconnect', username)
    // console.log('disconnect')
  })
})


http.listen(port, function() {
  console.log("listening on 3000")
})
