const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const { errorHandler } = require("./src/middleware/errorHandler");
const logger = require("./src/utils/logger");

const app = express();

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// 404 處理
app.use((req, res, next) => {
  res.status(404).json({ message: "未找到" });
});

// 錯誤處理中間件
app.use(errorHandler);

module.exports = app;
