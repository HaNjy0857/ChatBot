const Message = require("../models/message");

exports.saveMessage = async (room, text, user) => {
  try {
    const message = new Message({
      room,
      text,
      user,
    });
    await message.save();
    return message;
  } catch (error) {
    console.error("保存訊息時出錯:", error);
    throw error;
  }
};

exports.getRecentMessages = async (room, limit = 50) => {
  try {
    const messages = await Message.find({ room })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return messages.reverse();
  } catch (error) {
    console.error("獲取最近消息時出錯:", error);
    throw error;
  }
};

exports.deleteMessage = async (messageId) => {
  try {
    await Message.findByIdAndDelete(messageId);
  } catch (error) {
    console.error("刪除訊息時出錯:", error);
    throw error;
  }
};

exports.updateMessage = async (messageId, newText) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { text: newText },
      { new: true }
    );
    return updatedMessage;
  } catch (error) {
    console.error("更新訊息時出錯:", error);
    throw error;
  }
};
