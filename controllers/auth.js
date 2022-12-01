const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const crypto = require("crypto");
const createHash = require("../utils/createHash");
const { mailTransport } = require("../utils/sendEmail");

//register user
const register = async (req, res) => {
  const { email, username, password, phonenumber } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new BadRequestError("Email already exists");
  }

  const verificationToken = crypto.randomBytes(2).toString("hex");
  const user = await User.create({
    username,
    email,
    phonenumber,
    password,
    verificationToken,
  });

  //send Mail
  mailTransport.sendMail({
    from: '"We Barter" <weBarter@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "verify you email account", // Subject line
    html: `<h4> Hello, ${username}, kindly verify your account with this token: ${verificationToken}</h4>`, // html body
  });

  res.status(StatusCodes.CREATED).json({
    msg: "Success! Please check your email to verify account",
    user: user.username,
    email: user.email,
    userId: user._id
  });
};

//verify user
const verifyEmail = async (req, res) => {
  const { id } = req.params;
  const { verificationToken } = req.body;
  const user = await User.findOne({ _id: id });

  if (!user) {
    throw new UnauthenticatedError("Verification Failed");
  }

  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError("Verification Failed");
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = "";

  await user.save();

  //send Mail
  mailTransport.sendMail({
    from: '"We Barter" <weBarter@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "MAIL IS VERIFIED", // Subject line
    html: `<h4> Hello, ${user.username}</h4> <h2>Congrats</h2> you are now verified`, // html body
  });

  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
};

//user login
const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new BadRequestError(`Please provide username or password`);
  }
  const user = await User.findOne({ username });

  if (!user) {
    throw new BadRequestError(`Invalid Credentials`);
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new BadRequestError(`Invalid Credentials`);
  }

  if (!user.isVerified) {
    throw new UnauthenticatedError("Please verify your email");
  }

  let token = user.createJWT(user._id);

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.status(StatusCodes.OK).json({ msg: "Login Successful", token: token });
};

//user logout
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

//forget password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError("Please provide valid email");
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(2).toString("hex");

    // send email
    mailTransport.sendMail({
      from: `"We Barter" <weBarter@gmail.com>`,
      to: email,
      subject: "Reset you account",
      html: `<h4>Hi, kindly reset your password with this token: ${passwordToken}</h4>`,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res.status(StatusCodes.OK).json({
    msg: "Please check your email for reset password link",
  });
};

//reset password
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }
  res.status(StatusCodes.OK).json({ msg: "Password reset successful" });
};

//export modules
module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
