var socket = io();
socket.on('connect', function(){
  socket.emit('adduser', prompt('What is your name?'));
});

socket.on('chat message', function(from, msg, time, username) {
  if (username == 'switchroom') {
      $('.chat-ul').empty();
  };

  $('#user').text(username);
  var me = $('#user').text();
  if (from === 'SERVER') {
    var divclassmessage = 'server-message';
    var classDiv = '';
    var divClassTime = 'time-left-server';
  } else {
    var iclass = (from == me) ? 'me' : 'you';
    var divclassmessage = (from == me) ? 'me-message float-right' : 'you-message';
    var classDiv = (from == me) ? 'align-right' : '';
    var divClassTime = (from == me) ? 'time-right' : 'time-left';
    var from = (from == me) ? 'Me' : from;
  }

  var text_template = `<li class='clearfix col-sm-12'>
    <div class='message-data ${classDiv}'>
    <span class='message-data-name'><strong>${from}</strong></span>
    <i class='fa fa-circle ${iclass}'></i></div>
    <div class='message ${divclassmessage}'>
    <div class='${divClassTime}'>${time}</div>
    ${msg}</div>
    </li>`;

    $('.chat-ul').append(text_template)
    window.scrollBy(0, 1000)
});

socket.on('update-users-list', function(data, username) {
  $('#user').val(username);
  $('#users').empty();
  $.each(data, function(key, value) {
    if (key == username) {
      $('#users').append(`<a href=# class='list-group-item ' onClick=directMessage('${data[username]}','${value}')>${key}</a>`);
    } else {
      $('#users').append(`<a href=# class='list-group-item list-group-item-action' onClick=directMessage('${data[username]}','${value}')>${key}</a>`);
    };
  });
});

socket.on('updateroom', function(rooms, room) {
  $('#rooms').empty();
  $.each(rooms, function(key, value){
    if (value === room){
        $('#rooms').append(`<a href=# class='list-group-item active'> ${value} </a>`)
    } else {
      $('#rooms').append(`<a href=#  class='list-group-item list-group-item-action' onClick=switchRoom('${value}')>${value}</a>`)

    }
  });
});

socket.on('private room created', function(msg) {
  console.log('private');
  $('.chat-ul').empty();
  $('.chat-ul').append(`<div>${msg}</div>`);
});

function switchRoom(room) {
  socket.emit('switchroom', room);
}

function directMessage(from, to) {
  socket.emit('initiate private message', from, to)
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

socket.on('notify-messages', function(id, from, to){
  console.log('notify user about messages')
  var usersList = $('#users').find('a');
  for(var i = 0; i < usersList.length; i++){
    user = $(usersList[i]).text();
    console.log(from);
    if (user == from){
      // $(usersList[i]).append("<div id='notification-messages'></div>");
    }
  }
})

function notifyTyping() {
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
