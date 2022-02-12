"use strict";
import {
  validationResult
} from 'express-validator';
import bcrypt from 'bcrypt';
import dbconnect from '../config/database.config';

// Home Page
// exports.homePage = async (req, res, next) => {
//   dbconnect.getConnection(await function (err, connection) {
//     if (err) { throw err }
//     connection.query("SELECT * FROM realtor WHERE agentId = " + connection.escape(req.session.userID), function (error, results, fields) {
//       if (error) { throw error; }
//       if (results.length !== 1) {
//         return res.redirect('/logout');
//       }
//       res.render('index', {
//         realtor: results[0]
//       });

//     });
//   });
// }
//REALTOR DASHBOARD
exports.realtorDashboard = async (req, res, next) => {
  dbconnect.getConnection(await async function (err, connection) {
    if (err) {
      throw err
    }
    await connection.query("SELECT * FROM realtor WHERE agentId = " + connection.escape(req.session.userID), function (error, results, fields) {
      if (error) {
        throw error;
      }
      if (results.length !== 1) {
        return res.redirect('/realtor/login');
      }
      res.render('realtor-dashboard', {
        realtor: results[0]
      });

    });
    await connection.query('SELECT * FROM hires_table WHERE assigned_realtor=' + connection.escape(req.session.userID), function (error, results, fields) {
      if (error) throw error;
      res.render('realtor-dashboard', {
        assignments: results[0]
      });

    });
  });

}

//REGISTER USER
exports.registerRealtor = async (req, res, next) => {
  const errors = validationResult(req);
  const password = await bcrypt.hash(req.body.password, 10);
  if (!errors.isEmpty()) {
    return res.render('realtor-register', {
      error: errors.array()[0].msg
    });
  }
  dbconnect.getConnection(async function (err, connection) {
    if (err) {
      throw err
    }
    await connection.query('SELECT * FROM earb WHERE realtorNationalId = ' + connection.escape(req.body.govid) +
      'AND realtorLicence = ' + connection.escape(req.body.licence), async function (error, results, fields) {
        if (error) {
          throw error;
        }
        if (results.length !== 0) {
          const realtor = {
            fk_earb_id: results[0].realtorId,
            agentName: results[0].realtorName,
            agentEmail: req.body.email,
            agentPassword: password,
            agentLicence: results[0].realtorLicence,
            agentContact: req.body.contact,
            agentNationalId: results[0].realtorNationalId,
          };

          await connection.query('SELECT * FROM realtor WHERE agentEmail = ' + connection.escape(realtor.agentEmail), async function (error, results, fields) {
            if (error) {
              throw error;
            }
            if (results.length !== 0) {
              return res.render('realtor-register', {
                error: 'This email already in use. If this is you Login',
              });

            } else {
              await connection.query('INSERT INTO realtor SET ?', realtor, function (error, results, fields) {
                if (error) {
                  throw error;
                }
                if (results.affectedRows === 0) {
                  console.log(results);
                  return res.render('realtor-register', {
                    error: 'Your registration has failed.'
                  });
                }

                res.render("realtor-register", {
                  msg: 'You have successfully registered.'
                });
              });
            }
          });
        } else {
          res.render("realtor-register", {
            error: 'You are not Registered with EARB.'
          });
        }
      });
  });
}
exports.loginRealtor = (req, res) => {
  const errors = validationResult(req);
  const realtor = {
    agentNationalId: req.body.govid,
    agentPassword: req.body.password
  };
  if (!errors.isEmpty()) {
    return res.render('realtor-login', {
      error: errors.array()[0].msg
    });
  }
  dbconnect.getConnection(async function (err, connection) {
    if (err) {
      throw err
    }
    await connection.query('SELECT * FROM realtor WHERE agentNationalId = ' + connection.escape(realtor.agentNationalId), async function (error, results, fields) {
      if (error) {
        throw error
      }
      if (results.length === 1) {
        const comparePassword = await bcrypt.compare(req.body.password, results[0].agentPassword)
        if (comparePassword === true && results[0].agentNationalId === realtor.agentNationalId) {
          req.session.userID = results[0].agentId;
          return res.redirect('/realtor/dashboard');
        } else {
          res.render("realtor-login", {
            error: 'Check your credentials!'
          });
        }
      } else {
        res.render("realtor-login", {
          error: 'Check your credentials!!'
        });
      }
    })
  });
}
//GET ASSIGNMENTS

exports.getAssignments = (req, res) => {
  dbconnect.getConnection(function (err, connection) {
    if (err) throw err;

    // Use the connection
    connection.query('SELECT * FROM hires_table WHERE assigned_realtor=' + connection.escape(req.session.userID), function (error, results, fields) {
      console.log(results)
      // When done with the connection, release it.
      connection.release();

      // Handle error after the release.
      if (error) throw error;

      // Don't use the connection here, it has been returned to the pool.
    });
  });
}
