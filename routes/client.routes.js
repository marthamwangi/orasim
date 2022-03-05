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
//browse realtors
router
  .route('/browse-realtors')
  .get(poresClient.getRealtor);

//get single realtor
router
  .route('/get-realtor/:agentId')
  .get(poresClient.getSingleRealtor);
module.exports = router;
