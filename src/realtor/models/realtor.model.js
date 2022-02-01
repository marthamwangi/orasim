const dbConnect = require('../../config/database.config');

//constructor
const Realtor = function (realtor) {
  this.agentName = realtor.name;
  this.agentEmail = realtor.email;
  this.agentPassword = realtor.password;
  this.agentLicence = realtor.licence;
  this.agentContact = realtor.contact;
};
//CREATE REALTOR
Realtor.create = async (newRealtor, result) => {

  dbConnect.getConnection(async function (err, connection) {
    if (err) throw (err) //not connected
    await connection.query('SELECT * FROM realtor WHERE agentEmail = ' + connection.escape(newRealtor.agentEmail), async function (error, results, fields) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      } else {
        console.log("------> Search Results");
        console.log(results.length);
        if (results.length != 0) {
          connection.release();
          console.log('"-------> User already exists');
        } else {
          await connection.query('INSERT INTO realtor SET ?', newRealtor, function (error, results, fields) {
            if (error) throw error;
            console.log(results);
            if (err) throw (err)
            console.log("--------> Created new Realtor")
            result(null, {
              id: results.insertId,
              ...newRealtor
            });


          });
        }

      }
    })

  });



}

module.exports = Realtor;
