const ChatRoom = require("../models/chatroom");
const logger = require("../utils/logger");

exports.createRoom = async (roomData) => {
  try {
    const existingRoom = await ChatRoom.findOne({ name: roomData.roomName });

    if (existingRoom) {
      return {
        success: false,
        message: "聊天室名稱已存在",
      };
    }

    const newRoom = new ChatRoom({
      name: roomData.roomName,
      creator: String(roomData.creator),
      members: [String(roomData.creator)], // 創建者自動加入成員列表
      type: roomData.type || "public",
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
    const rooms = await ChatRoom.find({ type: "public" }).select(
      "name members createdAt lastActivity"
    );

    // 格式化返回數據
    const formattedRooms = rooms.map((room) => ({
      name: room.name,
      userCount: room.members.length,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
    }));

    return {
      success: true,
      data: formattedRooms,
    };
  } catch (error) {
    logger.error("獲取聊天室列表服務錯誤:", error);
    throw error;
  }
};
