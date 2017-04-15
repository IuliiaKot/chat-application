var mongoose = require('mongoose')

var uristring = process.env.MONGODB_URI || "mongodb://localhost/nodechat";
mongoose.connect(uristring);

var messageSchema = mongoose.Schema({
    room: String,
    message: String,
    author: String,
    date: String
})

var Message = mongoose.model('messages', messageSchema);

exports.message = Message;
