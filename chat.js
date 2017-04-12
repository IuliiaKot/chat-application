var socket = io();
socket.on('connect', function(){
  socket.emit('adduser', prompt('What is your name?'))
});

socket.on('chat message', function(from, msg, time, room){
  console.log(room)
  var me = $('#user').val();
  var iclass = (from == me) ? 'me' : 'you';
  var divclassmessage = (from == me) ? 'me-message float-right' : 'you-message';
  var classDiv = (from == me) ? 'align-right':'';
  var divClassTime = (from == me) ? 'time-right':'time-left';
  var from = (from == me) ? 'Me' : from;

  var text_template = `<li class='clearfix'>
    <div class='message-data ${classDiv}'>
    <span class='message-data-name'>${from}</span>
    <i class='fa fa-circle ${iclass}'></i></div>
    <div class='message ${divclassmessage}'>${msg}</div>
    <span class='${divClassTime}'>${time}</span></li>`

    $('.chat-ul').append(text_template)
    window.scrollBy(0, 1000)
});

socket.on('update-users-list', function(data){
  $('#users').empty();
  console.log(data)
  $.each(data, function(key, value){
    $('#users').append(`<div> ${key} </div>`)
  })
})

$(function(){
  var room;


  // $('.choose-room').on('click', 'li', function(e) {
  //   room = $(this).text();
  // })

  var time = new Date().toLocaleString();
  // socket.emit('chat message', 'System', '<b>' + name + '</b> has joined the discussion', time);

  $('form').on('submit', function(){
    var from  = $('#user').val();
    var msg = $('#m').val();
    var time = new Date().toLocaleString();
    socket.emit('chat message', from, msg, time, room)
    $('#m').val(' ');
    return false;
  })

});

function notifyTyping(){
  var user = $("#user").val();
  socket.emit('notify user', user);
};

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
