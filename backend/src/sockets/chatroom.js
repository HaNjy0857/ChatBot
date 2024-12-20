const chatService = require("../services/chatService");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // 發送訊息
    socket.on("sendMessage", async ({ room, message, timestamp, sender }) => {
      try {
        const result = await chatService.saveMessage(room, message, sender);

        if (result.success) {
          io.to(room).emit("message", result.data);
        }
      } catch (error) {
        console.error("發送訊息錯誤:", error);
        socket.emit("error", "發送訊息失敗");
      }
    });

    // 獲取最近的訊息
    socket.on("getRecentMessages", async (roomName) => {
      try {
        const result = await chatService.getRecentMessages(roomName);
        if (result.success) {
          socket.emit("recentMessages", result.data);
        }
      } catch (error) {
        console.error("獲取最近訊息錯誤:", error);
        socket.emit("error", "獲取訊息失敗");
      }
    });
  });
};
