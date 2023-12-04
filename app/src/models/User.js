"use strict";

const { response } = require("express");
const mongoose = require("mongoose");
const UserStorage = require("./UserStorage");
const bcrypt = require("bcrypt");
const saltRounds = 10; // salt를 몇 글자로 할지

class User {
  constructor(body) {
    this.body = body;
  }

  async login() {
    const client = this.body;
    try {
      const { id, psword } = await UserStorage.getUserInfo(client.id);

      if (id) {
        if (id === client.id && psword === client.psword) {
          return { success: true };
        }
        return { success: false, msg: "비밀번호가 틀렸습니다." };
      }
      return { success: false, msg: "존재하지 않는 아이디입니다." };
    } catch (err) {
      return { success: false, msg: err };
    }
  }

  async register() {
    const client = this.body;
    try {
      const response = await UserStorage.save(client);
      return response;
    } catch (err) {
      return { success: false, msg: err };
    }
  }
}

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // 스페이스를 없애주는 역할
    unique: 1, // 중복을 허용하지 않는다.
  },
  password: {
    type: String,
    minlength: 5,
  },
});

// save하기 전에 비밀번호를 암호화 시킨다.
userSchema.pre("save", function (next) {
    const user = this;
    // 비밀번호를 바꿀 때만 암호화 시킨다.
    if (user.isModified("password")) {
      bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
          if (err) return next(err);
          user.password = hash;
          next();
        });
      });
    } else {
      next();
    }
  });

  app.post("/api/users/login", (req, res) => {
    // 요청된 이메일을 데이터베이스에 있는지 찾는다.
    User.findOne(
      {
        email: req.body.email,
      },
      (err, user) => {
        if (!user) {
          return res.json({
            loginSuccess: false,
            message: "이메일에 해당하는 유저가 없습니다.",
          });
        }

        // 요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
          if (!isMatch) {
            return res.json({
              loginSuccess: false,
              message: "비밀번호가 틀렸습니다.",
            });
          }
          // 비밀번호까지 맞다면 토큰 생성
          user.generateToken((err, user) => {
            if (err) return res.status(400).send(err);
            // 토큰을 저장한다. 어디에? 쿠키, 로컬스토리지, 세션 등등
            res
              .cookie("x_auth", user.token)
              .status(200)
              .json({ loginSuccess: true, userId: user._id });
          });
        });
      }
    );
  });

const User = mongoose.model("User", userSchema); // 스키마를 모델로 감싸준다.

module.exports = User;