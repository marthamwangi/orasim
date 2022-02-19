"use strict";
import {
  check
} from 'express-validator';
require('../server.js');

const poresClient = require('../controller/client.controller');
var router = require("express").Router();
var pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
//if logged in
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.userID) {
    return res.render('index')
  }
  next();
}
//go to dashboard
const ifLoggedin = (req, res, next) => {
  if (req.session.userID) {
    return res.redirect('index')
  }
  next();
}
router.get("/hire_realtor", function (req, res) {
  res.render('client_hire')
});
//Register new user
router
  .route("/register")
  .get(function (req, res) {
    res.render('client_register');
  })
  .post([
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
  ], poresClient.registerClient);
//login
router
  .route('/login')
  .get(ifLoggedin, function (req, res) {
    res.render('client_login')
  })
  .post([
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
  ], poresClient.loginClient)

module.exports = router;
