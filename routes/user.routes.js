"use strict";
import {
  check
} from 'express-validator';
require('../server.js');

const {
  registerPage,
  registerUser,
} = require('../controller/user.controller');
var router = require("express").Router();
var pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
//if not logged in
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.userID) {
    return res.redirect('/login');
  }
  next();
}
// if logged in
const ifLoggedin = (req, res, next) => {
  if (req.session.userID) {
    return res.redirect('/');
  }
  next();
}
//Register new user
router
  .route("/register")
  .get(ifLoggedin, registerPage)
  .post(ifLoggedin,
    [
      check('name', 'Please provide your Full Name')
        .isLength({
          min: 5
        })
        .isAlpha('en-US', { ignore: ' ' }),
      check('email', 'Please enter a valid Email')
        .isEmail(pattern)
        .normalizeEmail(),
      check('password', 'Password must be greater than 8 characters and contain at least one uppercase letter, one lowercase letter, and one number')
        .isLength({
          min: 8,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1
        }),
      check('contact', 'Please enter a valid Phone Number!')
        .isMobilePhone(),
      check('govid', 'Please enter a numeric type ID Number!')
        .isNumeric(),
    ], registerUser);
module.exports = router;
