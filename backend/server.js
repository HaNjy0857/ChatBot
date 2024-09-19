const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const { sequelize } = require("./src/config/database");
const chatSocket = require("./src/sockets/chat");
const roomManagement = require("./src/sockets/roomManagement");
const logger = require("./src/utils/logger");
const app = require("./app");

const server = http.createServer(app);
const io = socketIo(server);

// 連接 MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("MongoDB 連接成功"))
  .catch((err) => logger.error("MongoDB 連接錯誤:", err));

// 同步 MySQL 表
sequelize
  .sync({ force: false })
  .then(() => {
    logger.info("MySQL 表同步完成");
  })
  .catch((err) => {
    logger.error("同步 MySQL 表時出錯:", err);
  });

// 設置 WebSocket
chatSocket(io);
roomManagement(io);

// 設置端口
const PORT = process.env.PORT || 3000;

// 啟動服務器
server.listen(PORT, () => logger.info(`服務器運行在端口 ${PORT}`));

// 優雅關閉
process.on("SIGTERM", () => {
  logger.info("收到 SIGTERM 信號：正在關閉 HTTP 服務器");
  server.close(() => {
    logger.info("HTTP 服務器已關閉");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB 連接已關閉");
      process.exit(0);
    });
    sequelize.close().then(() => {
      logger.info("MySQL 連接已關閉");
    });
  });
});
