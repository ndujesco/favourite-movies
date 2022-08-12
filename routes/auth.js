const { Router } = require("express");
const { body } = require("express-validator");


const User = require("../model/user");
const { getSignup, getLogin, postLogin, postSignup, postLogout } = require("../controllers/auth");


const router = Router();
const signupValidator = [
    body("email", "The email is invalid")
        .trim()
        .isEmail()
        .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
            return Promise.reject(
                "E-mail already exists, try a new one or log in");
            }
            return true;
        });
    }),
    body("password", "Password should not be less than 4 characters")
        .trim()
        .isLength({min: 4}),
    body("name", "Name field is required")
        .trim()
        .isLength({min: 1})
];

const loginValidator = [
    body("email", "The email is invalid")
        .trim()
        .isEmail(),
    body("password")
        .trim()
];

router.get("/login", getLogin);

router.get("/signup", getSignup);

router.post("/login", loginValidator, postLogin);

router.post("/signup", signupValidator, postSignup);

router.post("/logout",  postLogout);


module.exports = router;
