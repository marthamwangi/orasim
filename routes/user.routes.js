"use strict";
import {
  check
} from 'express-validator';
require('../server.js');

const {
  homePage,
  registerPage,
  registerUser,
  loginPage,
  loginUser,
  resetPasswordPage,
  resetPassword,
  postListingPage,
  postListing,
  browseRealtors,
  browseProperties,
  propertyOverview,
  adminDashboard,
  addUser,
  getUser,
  getSingleRealtor,
  profileSettingPage,
  deleteUser,
  updateUser,
  hireRealtor
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
router
  .route('/')
  .get(ifNotLoggedin, homePage)
router
  .route('/reset-password')
  .get(ifLoggedin, resetPasswordPage)
  .post(ifLoggedin, [
    check('email', 'Please enter a valid Email')
      .isEmail(pattern)
      .normalizeEmail(),
  ], resetPassword);
//admin
router
  .route('/admin')
  .get(ifNotLoggedin, adminDashboard)
router
  .route('/post-listing')
  .get(ifNotLoggedin, postListingPage)
  .post(ifNotLoggedin, postListing);//Register new user
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
        .isMobilePhone()
    ], registerUser);

//login
router
  .route('/login')
  .get(ifLoggedin, loginPage)
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
  ], loginUser);

router
  .route('/logout')
  .get((req, res, next) => {
    req.session.destroy((err) => {
      next(err);
    });
    res.redirect('/login');
  });

router
  .route('/browse-realtors')
  .get(browseRealtors)
router
  .route('/browse-properties')
  .get(browseProperties)
router
  .route('/property-overview')
  .get(propertyOverview);
router
  .route('/users/users-add-user')
  .get(addUser)
  .post()
router
  .route('/edit-user/:id')
  .get(getUser)
  .post()
router
  .route('/update-user/:id')
  .get(updateUser)
  .post(updateUser)
router
  .route('/delete-user/:id')
  .get(deleteUser)
  .post()
router
  .route('/hire-realtor/:realtorId')
  .get(getSingleRealtor)
  .post(hireRealtor);
router
  .route('/setting')
  .get(profileSettingPage);
router
  .route('/properties')
  .get(profileSettingPage);
module.exports = router;
