import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [roomName, setRoomName] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("recentMessages", (recentMessages) => {
      setMessages(recentMessages);
    });

    newSocket.on("roomError", (error) => {
      console.error("Room error:", error);
    });

    return () => newSocket.close();
  }, []);

  const createRoom = () => {
    if (roomName && socket) {
      socket.emit("createRoom", roomName);
    }
  };

  const joinRoom = () => {
    if (roomName && socket) {
      socket.emit("joinRoom", roomName);
    }
  };

  const leaveRoom = () => {
    if (roomName && socket) {
      socket.emit("leaveRoom", roomName);
      setRoomName("");
      setMessages([]);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage && socket && roomName) {
      socket.emit("sendMessage", { room: roomName, message: inputMessage });
      setInputMessage("");
    }
  };

  return (
    <div>
      <div>
        <input
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="输入房间名"
        />
        <button onClick={createRoom}>创建房间</button>
        <button onClick={joinRoom}>加入房间</button>
        <button onClick={leaveRoom}>离开房间</button>
      </div>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message.text}</div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit">发送</button>
      </form>
    </div>
  );
};

export default Chat;
