const bcrypt = require('bcrypt');
const Realtor = require("../models/realtor.model");
exports.create = async (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "content cannot be empty"
    });
  }
  const password = await bcrypt.hash(req.body.password, 10);

  //Register Realtor to system
  const realtor = new Realtor({
    name: req.body.name,
    email: req.body.email,
    password: password,
    licence: req.body.licence,
    contact: req.body.contact
  });
  //save realtor to db
  Realtor.create(realtor, (err, data) => {
    if (err) {
      res.status(500).send({
        message:
          err.message || "Some error occured while registering Realtor"
      });
    } else { res.send(data) }

  })
}
