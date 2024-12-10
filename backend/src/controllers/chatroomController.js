const chatroomService = require("../services/chatroomService");
const logger = require("../utils/logger");

exports.createRoom = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const creator = req.user._id; // 假設使用者資訊存在 req.user 中

    logger.info("開始建立聊天室", { name, creator });

    const result = await chatroomService.createRoom({
      name,
      description,
      type,
      creator,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    logger.error("建立聊天室錯誤:", error);
    res.status(500).json({ success: false, message: "服務器錯誤，請稍後再試" });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const result = await chatroomService.getRooms();
    res.status(200).json(result);
  } catch (error) {
    logger.error("獲取聊天室列表錯誤:", error);
    res.status(500).json({ success: false, message: "服務器錯誤，請稍後再試" });
  }
};
