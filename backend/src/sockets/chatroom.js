const chatService = require("../services/chatService");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // 發送房間消息
    socket.on("sendMessage", async ({ room, message }) => {
      const newMessage = await chatService.saveMessage(
        room,
        message,
        socket.id
      );
      io.to(room).emit("message", newMessage);

      // 更新大廳中顯示的最後一條消息
      io.emit("updateLastMessage", { room, message: newMessage });
    });

    // 獲取最近的消息
    socket.on("getRecentMessages", async (roomName) => {
      const recentMessages = await chatService.getRecentMessages(roomName);
      socket.emit("recentMessages", recentMessages);
    });

    // 私聊消息
    socket.on("privateMessage", ({ to, message }) => {
      socket.to(to).emit("privateMessage", {
        from: socket.id,
        text: message,
      });
    });
  });
};
