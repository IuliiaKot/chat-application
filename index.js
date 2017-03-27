var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');


app.use(express.static(path.join(__dirname)));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '../chat-application', 'index.html'))
});

io.on('connection', function(socket) {
  socket.on('char message', function(from, msg){
    io.emit('chat message', from, msg)
  })

  socket.on('notify user', function(user){
    io.emit('notify user', user)
  })
})


http.listen(3000, function() {
  console.log("listening on 3000")
})
