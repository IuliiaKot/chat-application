var mongoose = require('mongoose')

mongoose.connect("mongodb://localhost/nodechat");

var messageSchema = mongoose.Schema({
    room: String,
    message: String,
    author: String,
    date: String
})

var Message = mongoose.model('messages', messageSchema);

exports.message = Message;
