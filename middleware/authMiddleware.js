const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader); // 

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "authentication invalid" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const { username, user_id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { username, user_id };
    next();
    

  } catch (error) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "authentication sss invalid" });
  } 
}
module.exports = authMiddleware;