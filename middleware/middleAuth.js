const jwt = require("jsonwebtoken");

const middleAuth = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    next();
  }
  const token = authHeader.split(" ")[1];
  console.log(token);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: payload.userId,
      user: payload.username,
      email: payload.email,
    };

    next();
  } catch (error) {
    next();
  }
};

module.exports = middleAuth;
