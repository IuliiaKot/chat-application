var socket = io();
socket.on('connect', function(){
  socket.emit('adduser', prompt('What is your name?'));
});

socket.on('chat message', function(from, msg, time, username) {
  console.log(msg)
  $('#user').text(username);
  var me = $('#user').text();
  console.log(`${from}: from`);
  console.log(`${me}: me`);
  if (from === 'SERVER') {
    divclassmessage ='server-message';
    classDiv = '';
    divClassTime = 'time-left-server';
  } else {
    var iclass = (from == me) ? 'me' : 'you';
    var divclassmessage = (from == me) ? 'me-message float-right' : 'you-message';
    var classDiv = (from == me) ? 'align-right':'';
    var divClassTime = (from == me) ? 'time-right':'time-left';
    var from = (from == me) ? 'Me' : from;
  }

  var text_template = `<li class='clearfix'>
    <div class='message-data ${classDiv}'>
    <span class='message-data-name'>${from}</span>
    <i class='fa fa-circle ${iclass}'></i></div>
    <div class='message ${divclassmessage}'>${msg}</div>
    <span class='${divClassTime}'>${time}</span></li>`

    $('.chat-ul').append(text_template)
    window.scrollBy(0, 1000)
});

socket.on('update-users-list', function(data, username) {

  $('#user').val(username);
  $('#users').empty();
  $.each(data, function(key, value){
    $('#users').append(`<div> ${key} </div>`);
  });
});

socket.on('updateroom', function(rooms, room) {
  $('#rooms').empty();
  $.each(rooms, function(key, value){
    if (value === room){
        $('#rooms').append(`<div> ${value} </div>`)
    } else {
      $('#rooms').append(`<div><a href=# onClick=switchRoom('${value}')>${value}</a></div>`)

    }
  });
});

function switchRoom(room) {
  socket.emit('switchroom', room);
}

$(function() {
  var time = new Date().toLocaleString();

  $('form').on('submit', function() {
    var from  = $('#user').val();
    var msg = $('#m').val();
    var time = new Date().toLocaleString();
    socket.emit('send message', from, msg, time)
    $('#m').val(' ');
    return false;
  });

});

function notifyTyping(){
  var user = $("#user").val();
  socket.emit('notify user', user);
};

socket.on('notify user', function(user) {
  var me = $('#user').val();
  if (me != user) {
    $('#notifyUser').text(user + ' is typing ...');
  }
  setTimeout(function() { $('#notifyUser').text(''); }, 1000);
});
