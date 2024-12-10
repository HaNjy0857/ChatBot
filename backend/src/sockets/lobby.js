const chatService = require("../services/chatService");
const db = require("../models");
const ChatRoom = require("../models/chatroom");

// 添加這行：定義 rooms Map
const rooms = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("用戶已連接");

    // 創建房間
    socket.on("createRoom", async (data) => {
      try {
        console.log("接收到創建房間請求，數據:", data);

        const existingRoom = await ChatRoom.findOne({ name: data.roomName });
        if (existingRoom) {
          return socket.emit("error", "房間已存在");
        }

        const user = await db.User.findOne({
          where: { username: data.creator },
        });

        if (!user) {
          return socket.emit("error", "找不到用戶");
        }

        const newRoom = new ChatRoom({
          name: data.roomName,
          creator: user.id,
          members: [user.id],
          type: "public",
        });
        await newRoom.save();

        const message = await chatService.saveMessage(
          data.roomName,
          "房間已創建",
          "系統"
        );

        socket.join(data.roomName);

        io.emit("roomCreated", {
          roomName: data.roomName,
          lastMessage: message,
          creator: data.creator,
        });

        const rooms = await ChatRoom.find({ type: "public" })
          .populate("creator", "username")
          .select("name members");

        io.emit(
          "roomList",
          rooms.map((room) => ({
            name: room.name,
            userCount: room.members.length,
          }))
        );
      } catch (error) {
        console.error("創建房間錯誤:", error);
        socket.emit("error", "創建房間失敗");
      }
    });

    // 處理斷開連接
    socket.on("disconnect", () => {
      console.log("用戶斷開連接");
      // 清理用戶所在的所有房間
      rooms.forEach((room, roomName) => {
        if (room.users.has(socket.id)) {
          room.users.delete(socket.id);
          io.to(roomName).emit("userLeft", {
            user: socket.id,
            message: "用戶斷開連接",
          });
          if (room.users.size === 0) {
            rooms.delete(roomName);
            io.emit("roomClosed", roomName);
          }
        }
      });
    });
  });
};
