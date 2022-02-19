"use strict";
import {
  check
} from 'express-validator';
require('../server.js');
const realtor = require('../controller/realtor.controller');
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
    return res.redirect('/realtor/dashboard')
  }
  next();
}
//This will be the homepage
router.get("/", ifNotLoggedin, function (req, res) {
  res.render('index');

});
//Register new user
router
  .route("/register")
  .get(function (req, res) {
    res.render('realtor-register');
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
    check('licence', 'Please enter a numeric type Licence!')
      .isNumeric(),
    check('contact', 'Please enter a valid Phone Number!')
      .isMobilePhone(),
    check('govid', 'Please enter a numeric type ID Number!')
      .isNumeric(),
  ], realtor.registerRealtor);


//login
router
  .route("/login")
  .get(ifLoggedin, function (req, res) {
    res.render('realtor-login');
  })
  .post([
    check('password', 'Password must be greater than 8 characters and contain at least one uppercase letter, one lowercase letter, and one number')
      .isLength({
        min: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1
      }),
    check('govid', 'Please enter a numeric type ID Number!')
      .isNumeric(),
  ], realtor.loginRealtor);
//logout
router.get("/logout", ifLoggedin, (req, res, next) => {
  req.session.destroy((err) => {
    next(err);
  });
  res.redirect('/realtor/login')
});



//This will be the dashboard routes
router.get("/dashboard", realtor.realtorDashboard);
router.get("/add_listing", realtor.createListing);
//REALTOR PROFILE
router
  .route("/realtor_profile")
  .get(realtor.getRealtorProfile)
  .post(realtor.uploadAvatar.single('profile'), realtor.updateRealtorProfile)
module.exports = router;
