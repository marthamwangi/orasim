import dbConnect from '../config/database.config';
import bcrypt from 'bcrypt';

//constructor
const Realtor = function (realtor) {
  this.agentName = realtor.name;
  this.agentEmail = realtor.email;
  this.agentPassword = realtor.password;
  this.agentLicence = realtor.licence;
  this.agentContact = realtor.contact;
  this.agentNationalId = realtor.govid;
};
//CREATE REALTOR
Realtor.create = (newRealtor, result) => {
  dbConnect.getConnection(async function (err, connection) {
    var sql = 'SELECT * FROM earb WHERE realtorNationalId = ' + connection.escape(newRealtor.agentNationalId) + 'AND realtorLicence =' + connection.escape(newRealtor.agentLicence);
    if (err) { throw (err); } //not connected
    //is user in earb API?
    try {
      await connection.query(sql, async function (error, results, fields) {
        if (error) throw error;
        // console.log(newRealtor);
        // console.log(result);
        // console.log(results.length);
        // console.log(fields.length);
        if (results.length === 0) {
          errors.push("Please register with EARB")
          result(handleErrors, null)

        } else {
          console.log('Proceed')

        }

      })

    } catch (error) {
      throw error;
    }

  });
}
//LOGIN REALTOR


module.exports = Realtor;
