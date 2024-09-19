const chatController = require("../controllers/chatController");

module.exports = (io) => {
  chatController.handleConnection(io);
};
