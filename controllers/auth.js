const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const User = require("../model/user");

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    errorMessage: null,
    oldInput: {},
    validationErrors: [],
  });
};

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    errorMessage: null,
    oldInput: {},
    validationErrors: [],
  });
};

exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/login", {
      errorMessage: errors.array()[0].msg,
      oldInput: req.body,
      validationErrors: errors.array(),
    });
  }
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      return res.render("auth/login", {
        errorMessage: "User does not exist",
        oldInput: req.body,
        validationErrors: [],
      });
    }
    const isSame = await bcrypt.compare(password, foundUser.password);
    if (!isSame) {
      return res.render("auth/login", {
        errorMessage: "Password is incorrect",
        oldInput: req.body,
        validationErrors: [],
      });
    }
    req.session.user = foundUser;
    req.session.isAuthenticated = true;
    return req.session.save((err) => {
      res.redirect("/my-movies");
    });
  } catch (err) {
    console.log(err);
    res.redirect("/auth/login");
  }
};

exports.postSignup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("auth/signup", {
      errorMessage: errors.array()[0].msg,
      oldInput: req.body,
      validationErrors: errors.array(),
    });
  }
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = User({
      email,
      name,
      password: hashedPassword,
      movies: [],
    });
    const newUser = await user.save();
    if (newUser) {
      req.session.user = user;
      req.session.isAuthenticated = true;
      return res.redirect("/my-movies");
    }
    return res.redirect("/auth/signup");
  } catch (err) {
    console.log(err);
    res.redirect("/auth/signup");
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};
