const Message = require("../models/message");
const logger = require("../utils/logger");

exports.saveMessage = async (roomName, content, userId) => {
  try {
    console.log("=== 開始儲存訊息 ===");
    console.log("接收到的參數:", {
      roomName,
      content,
      userId,
    });

    const message = new Message({
      room: String(roomName),
      user: String(userId),
      content: "text",
      text: content,
    });

    console.log("準備儲存的訊息物件:", message);

    const savedMessage = await message.save();
    console.log("成功儲存訊息:", savedMessage);

    const formattedMessage = {
      success: true,
      data: {
        id: savedMessage._id,
        text: savedMessage.text,
        sender: savedMessage.user,
        timestamp: savedMessage.createdAt,
        room: savedMessage.room,
      },
    };

    console.log("返回格式化後的訊息:", formattedMessage);
    console.log("=== 儲存訊息完成 ===");

    return formattedMessage;
  } catch (error) {
    console.error("儲存訊息失敗:", error);
    logger.error("儲存訊息錯誤:", error);
    throw error;
  }
};

exports.getRecentMessages = async (roomName, limit = 50) => {
  try {
    const messages = await Message.find({ room: roomName })
      //.sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: messages.map((msg) => ({
        text: msg.content,
        sender: msg.user,
        timestamp: msg.createdAt,
        room: msg.room,
      })),
    };
  } catch (error) {
    logger.error("獲取最近訊息錯誤:", error);
    throw error;
  }
};

exports.getLastMessage = async (roomName) => {
  try {
    const message = await Message.findOne({ room: roomName })
      //.sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: message
        ? {
            text: message.content,
            sender: message.user,
            timestamp: message.createdAt,
            room: message.room,
          }
        : null,
    };
  } catch (error) {
    logger.error("獲取最後訊息錯誤:", error);
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
