const chatService = require("../services/chatService");

class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = new Map();
  }

  handleConnection(socket) {
    console.log("用户已连接:", socket.id);

    socket.on("createRoom", (roomName) => this.createRoom(socket, roomName));
    socket.on("joinRoom", (roomName) => this.joinRoom(socket, roomName));
    socket.on("leaveRoom", (roomName) => this.leaveRoom(socket, roomName));
    socket.on("disconnect", () => this.handleDisconnect(socket));
  }

  createRoom(socket, roomName) {
    if (this.rooms.has(roomName)) {
      socket.emit("roomError", "房间已存在");
    } else {
      this.rooms.set(roomName, new Set([socket.id]));
      socket.join(roomName);
      socket.emit("roomCreated", roomName);
      console.log(`房间 ${roomName} 已创建`);
    }
  }

  async joinRoom(socket, roomName) {
    if (this.rooms.has(roomName)) {
      const room = this.rooms.get(roomName);
      room.add(socket.id);
      socket.join(roomName);
      socket.emit("roomJoined", roomName);

      // 获取最近的消息
      const recentMessages = await chatService.getRecentMessages(roomName);
      socket.emit("recentMessages", recentMessages);

      // 通知其他用户
      socket.to(roomName).emit("userJoined", socket.id);
      console.log(`用户 ${socket.id} 加入了房间 ${roomName}`);
    } else {
      socket.emit("roomError", "房间不存在");
    }
  }

  leaveRoom(socket, roomName) {
    if (this.rooms.has(roomName)) {
      const room = this.rooms.get(roomName);
      room.delete(socket.id);
      socket.leave(roomName);
      socket.emit("roomLeft", roomName);

      // 通知其他用户
      socket.to(roomName).emit("userLeft", socket.id);
      console.log(`用户 ${socket.id} 离开了房间 ${roomName}`);

      if (room.size === 0) {
        this.rooms.delete(roomName);
        console.log(`房间 ${roomName} 已被删除`);
      }
    }
  }

  handleDisconnect(socket) {
    console.log("用户已断开连接:", socket.id);
    this.rooms.forEach((users, roomName) => {
      if (users.has(socket.id)) {
        this.leaveRoom(socket, roomName);
      }
    });
  }
}

module.exports = (io) => {
  const roomManager = new RoomManager(io);
  io.on("connection", (socket) => roomManager.handleConnection(socket));
};
