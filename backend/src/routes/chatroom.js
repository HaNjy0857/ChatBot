const express = require("express");
const router = express.Router();
const chatroomController = require("../controllers/chatroomController");
const { authenticateToken } = require("../middleware/auth");

// 獲取聊天室列表
router.get("/", authenticateToken, chatroomController.getRooms);

// 創建新聊天室
router.post("/", authenticateToken, chatroomController.createRoom);

module.exports = router;
