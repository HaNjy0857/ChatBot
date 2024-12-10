import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  Grid,
  Divider,
  AppBar,
  Toolbar,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../contexts/AuthContext";

const Lobby = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    if (socket) {
      socket.close();
    }
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to lobby server");
    });

    newSocket.on("roomList", (roomList) => {
      console.log("Received room list:", roomList);
      setRooms(roomList);
    });

    newSocket.on("roomCreated", ({ roomName }) => {
      console.log("Room created:", roomName);
      newSocket.emit("getRooms");
    });

    newSocket.on("roomClosed", (closedRoomName) => {
      newSocket.emit("getRooms");
    });

    newSocket.emit("getRooms");

    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [isAuthenticated, navigate]);

  const createRoom = () => {
    if (newRoomName && socket) {
      console.log("Attempting to create room:", newRoomName);
      socket.emit("createRoom", {
        roomName: newRoomName,
        creator:
          user?.username || localStorage.getItem("username") || "Anonymous",
      });
      setNewRoomName("");
    }
  };

  const joinRoom = (roomName) => {
    if (socket) {
      console.log("Joining room:", roomName);
      socket.emit("joinRoom", roomName);
      navigate(`/chat/${roomName}`);
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">聊天室大廳</Typography>
          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            登出
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
        {isAuthenticated ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="輸入新房間名稱"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={createRoom}
                  disabled={!newRoomName.trim() || !socket}
                >
                  創建房間
                </Button>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              可用房間
            </Typography>
            <List>
              {rooms.map((room) => (
                <ListItem
                  key={room.name}
                  disablePadding
                  sx={{
                    mb: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1">
                      {room.name}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({room.userCount || 0})
                      </Typography>
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => joinRoom(room.name)}
                    size="small"
                  >
                    加入
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <Typography variant="h6">請先登入以訪問大廳</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Lobby;
