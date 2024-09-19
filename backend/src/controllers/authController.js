const authService = require("../services/authService");
const { handleError } = require("../middleware/errorHandler");

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    await authService.register(username, password, role);
    res.status(201).json({ message: "注册成功" });
  } catch (error) {
    handleError(res, error);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const { token, role } = await authService.login(username, password);
    res.json({ token, role });
  } catch (error) {
    handleError(res, error);
  }
};
