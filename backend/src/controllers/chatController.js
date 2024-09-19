const Message = require("../models/message");
const chatService = require("../services/chatService");

exports.handleConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("用户已连接");
    let currentUser = null;

    socket.on("setUsername", (username) => {
      currentUser = username;
    });

    socket.on("joinRoom", async (room) => {
      socket.join(room);
      console.log(`用户 ${currentUser} 加入了房间: ${room}`);

      const message = await chatService.saveMessage(
        room,
        `${currentUser} 加入了房间`,
        "系统"
      );
      io.to(room).emit("message", { text: message.text, user: message.user });

      const recentMessages = await chatService.getRecentMessages(room);
      socket.emit("previousMessages", recentMessages);
    });

    socket.on("leaveRoom", async (room) => {
      socket.leave(room);
      console.log(`用户 ${currentUser} 离开了房间: ${room}`);

      const message = await chatService.saveMessage(
        room,
        `${currentUser} 离开了房间`,
        "系统"
      );
      io.to(room).emit("message", { text: message.text, user: message.user });
    });

    socket.on("sendMessage", async ({ room, message }) => {
      const newMessage = await chatService.saveMessage(
        room,
        message,
        currentUser
      );
      io.to(room).emit("message", {
        text: newMessage.text,
        user: newMessage.user,
      });
    });

    socket.on("disconnect", () => {
      console.log(`用户 ${currentUser} 已断开连接`);
    });
  });
};
