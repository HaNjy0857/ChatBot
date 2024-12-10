const mongoose = require("mongoose");

const ChatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  type: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ChatRoom", ChatRoomSchema);
