const User = require("../models/User");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const { hashPassword, comparePassword } = require("../utils/hashPassword");
const logger = require("../utils/logger");

exports.register = async (username, password, role = "user") => {
  try {
    const hashedPassword = await hashPassword(password);
    await User.create({ username, password: hashedPassword, role });
    logger.info(`新用户注册: ${username}`);
  } catch (error) {
    logger.error(`用户注册失败: ${error.message}`);
    throw error;
  }
};

exports.login = async (username, password) => {
  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await comparePassword(password, user.password))) {
      throw new Error("用户名或密码错误");
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
        algorithm: jwtConfig.algorithm,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }
    );

    logger.info(`用户登录成功: ${username}`);
    return { token, role: user.role };
  } catch (error) {
    logger.error(`用户登录失败: ${error.message}`);
    throw error;
  }
};
