"use strict";
require('../server.js');

const orasim_client = require('../controller/client.controller');
var router = require("express").Router();

router.get("/hire_realtor", function (req, res) {
  res.render('client_hire')
});

module.exports = router;
