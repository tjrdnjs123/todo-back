const User = require("../model/User");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const userController = {};

userController.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("이미 가입이 된 유저입니다");
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    console.log("hash", hash);
    const newUser = new User({ name, email, password: hash });
    await newUser.save();
    res.status(200).json({ status: "ok", data: newUser });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

userController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }, "-createdAt -updatedAt -__v");
    if (user) {
      const isMatch = bcrypt.compareSync(password, user.password); // true
      if (isMatch) {
        const token = user.generateToken(); // 수정된 부분
        return res.status(200).json({ status: "ok", user, token });
      }
    }
    throw new Error("아이디 또는 비밀번호가 일치하지 않습니다");
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = userController;
