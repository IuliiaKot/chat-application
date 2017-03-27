  var socket = io();
$(function(){

  var name = makeid();
  $('#user').val(name);

  $('form').on('submit', function(){
    var from  = $('#user').val();
    var msg = $('#m').val();
    socket.emit('char message', from, msg)
    $('#m').val(' ');
    return false;
  })

  socket.on('chat message', function(from, msg){
    var me = $('#user').val();
    var iclass = (from == me) ? 'me' : 'you';
    var divclass = (from == me) ? 'me-message float-right' : 'you-message';
    var classDiv = (from == me) ? 'align-right':'';
    var from = (from == me) ? 'Me' : from;

    var text_template = `<li class='clearfix'>
      <div class='message-data ${classDiv}'>
      <span class='message-data-name'>${from}</span>
      <i class='fa fa-circle ${iclass}'></i></div>
      <div class='message ${divclass}'>${msg}</div></li>`

    // $('#messages').append('<li><b style="color:' + color + '">' + from + '</b>: ' + msg + '</li>');
    $('.chat-ul').append(text_template)
  });

});

function notifyTyping(){
  var user = $("#user").val();
  socket.emit('notify user', user);
}


socket.on('notify user', function(user){
  var me = $('#user').val();
  if (me != user) {
    $('#notifyUser').text(user + ' is typing ...');
  }
  setTimeout(function(){ $('#notifyUser').text(''); }, 1000);
})

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ ) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
