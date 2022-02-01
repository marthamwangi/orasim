const path = require("path");
require('../../../server.js');
const realtor = require('../controller/realtor.controller');
var router = require("express").Router();
//Register new user
router.post("/", realtor.create);

// app.use('/api/realtor', router);
router.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});
module.exports = router;
