"use strict";
import {
  check
} from 'express-validator';
require('../server.js');

const poresClient = require('../controller/client.controller');
var router = require("express").Router();
var pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
//if not logged in
const ifNotLoggedin = (req, res, next) => {
  if (!req.session.userID) {
    return res.redirect('/client/login');
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
//homepage
router.get("/", ifNotLoggedin, function (req, res) {
  res.render('index');
});
//logout
router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    next(err);
  });
  res.redirect('/client/login');
});
//Register new user
router
  .route("/register")
  .get(ifLoggedin, function (req, res) {
    res.render('client_register');
  })
  .post(ifLoggedin, [
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
  .post(ifLoggedin, [
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
  ], poresClient.loginClient);

//browse realtors
router
  .route('/browse-realtors')
  .get(poresClient.getRealtor);

//get single realtor
router
  .route('/get-realtor/:agentId')
  .get(poresClient.getSingleRealtor);
module.exports = router;
