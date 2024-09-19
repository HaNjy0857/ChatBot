const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  room: String,
  text: String,
  user: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
