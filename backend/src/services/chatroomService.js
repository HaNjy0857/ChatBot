const ChatRoom = require("../models/chatroom");
const logger = require("../utils/logger");

exports.createRoom = async (roomData) => {
  try {
    const existingRoom = await ChatRoom.findOne({ name: roomData.name });

    if (existingRoom) {
      return {
        success: false,
        message: "聊天室名稱已存在",
      };
    }

    const newRoom = new ChatRoom({
      name: roomData.name,
      description: roomData.description,
      creator: roomData.creator,
      type: roomData.type || "public",
      members: [roomData.creator], // 創建者自動加入成員列表
    });

    await newRoom.save();

    return {
      success: true,
      message: "聊天室建立成功",
      data: newRoom,
    };
  } catch (error) {
    logger.error("建立聊天室服務錯誤:", error);
    throw error;
  }
};

exports.getRooms = async () => {
  try {
    const rooms = await ChatRoom.find({ type: "public" })
      .populate("creator", "username")
      .select("name description members createdAt lastActivity");

    return {
      success: true,
      data: rooms,
    };
  } catch (error) {
    logger.error("獲取聊天室列表服務錯誤:", error);
    throw error;
  }
};
