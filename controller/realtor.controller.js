"use strict";
import {
  validationResult
} from 'express-validator';
import bcrypt from 'bcrypt';
import dbconnect from '../config/database.config';
import multer from 'multer';
import path from 'path';
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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/profiles'))
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = {
      'image/jpeg': '.jpeg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
    }
    cb(null, file.fieldname + '-' + Date.now() + uniqueSuffix[file.mimetype])
  }
})

const uploadAvatar = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log(file.mimetype)
    if (file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/gif') {
      cb(null, true);
    } else {
      cb(null, false);
      req.fileError = 'File format is not valid';
    }
  }
})

//REALTOR DASHBOARD
const realtorDashboard = async (req, res, next) => {
  dbconnect.getConnection(await
    function (err, connection) {
      if (err) {
        throw err
      }
      connection.query("SELECT * FROM realtor WHERE agentId = " + connection.escape(req.session.userID), async function (error, realtor_result, fields) {
        if (error) {
          throw error;
        }
        if (realtor_result.length !== 1) {
          return res.redirect('/realtor/login');
        }
        await connection.query('SELECT * FROM hires_table WHERE assigned_realtor=' + connection.escape(req.session.userID), function (error, assisgnments_results, fields) {
          if (error) {
            throw error
          };
          res.render('realtor-dashboard', {
            realtor: realtor_result[0],
            assignments: assisgnments_results
          });
        });


      });
    });
}
const createListing = async (req, res, next) => {
  dbconnect.getConnection(await
    function (err, connection) {
      if (err) {
        throw err
      }
      connection.query("SELECT * FROM realtor WHERE agentId = " + connection.escape(req.session.userID), function (error, results, fields) {
        if (error) {
          throw error;
        }
        if (results.length !== 1) {
          return res.redirect('/realtor/login');
        }
        res.render('add_listing', {
          realtor: results[0],
        });

      });
    });
}
const getRealtorProfile = async (req, res) => {
  dbconnect.getConnection(await
    function (err, connection) {
      if (err) {
        throw err
      }
      connection.query("SELECT * FROM realtor WHERE agentId = " + connection.escape(req.session.userID), function (error, realtor_result, fields) {
        if (error) {
          throw error;
        }
        if (realtor_result.length !== 1) {
          return res.redirect('/realtor/login');
        }
        res.render('realtor_profile', {
          realtor: realtor_result[0],

        });
      });


    })
}
//UPDATE REALTOR
const updateRealtorProfile = async (req, res) => {
  const errors = validationResult(req);
  //Get new password
  if (!errors.isEmpty()) {
    return res.render('realtor_profile', {
      error: errors.array()[0].msg
    });
  }
  dbconnect.getConnection(await function (err, connection) {
    if (err) {
      throw err
    }
    var sql = "UPDATE realtor SET agentImage = ?, agentEmail = ? , agentContact = ?, agentBio = ? WHERE agentId = ?";
    connection.query(sql, [req.file.filename, req.body.email, req.body.contact, req.body.bio, req.session.userID], async function (error, update_result, fields) {
      if (error) {
        throw error;
      }
      if (update_result.affectedRows === 0) {
        return res.render('realtor_profile', {
          error: 'Could not update your profile.'
        });
      }

      res.redirect('realtor_profile');

    })
  })

}
//REGISTER USER
const registerRealtor = async (req, res, next) => {
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
const loginRealtor = (req, res) => {
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


module.exports = {
  registerRealtor,
  loginRealtor,
  realtorDashboard,
  createListing,
  getRealtorProfile,
  updateRealtorProfile,
  uploadAvatar,

}
