"use strict";
import {
  validationResult
} from 'express-validator';
import bcrypt from 'bcrypt';
import dbconnect from '../config/database.config';

const registerPage = (req, res, next) => {
  res.render("register")
}
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  const { body } = req;
  const password = await bcrypt.hash(body.password, 10)
  if (!errors.isEmpty()) {
    return res.render('register', {
      error: errors.array()[0].msg
    });
  }
  try {
    dbconnect.getConnection(async (err, connection) => {
      if (err) {
        throw err;
      }
      var LookupRealtor = 'SELECT * FROM earb WHERE realtorNationalId = ?';
      var findEmail = 'SELECT * FROM users_table WHERE user_email = ?';
      var insertUser = 'INSERT INTO users_table SET ?'
      var updateRole = 'UPDATE users_table SET user_role = ?'
      await connection.query(LookupRealtor, [body.govid], async (error, realtor_result, fields) => {
        if (error) {
          throw error;
        }
        if (realtor_result.length === 1) {
          const realtor = {
            user_name: realtor_result[0].realtorName,
            user_email: body.email,
            user_password: password,
            user_contact: body.contact,
            user_govid: realtor_result[0].realtorNationalId,
          };

          await connection.query(findEmail, [body.email], async (error, email_result, fields) => {
            if (error) {
              throw error;
            }
            if (email_result.length !== 0) {
              return res.render('register', {
                error: 'This email already in use. If this is you Login',
              });
            }
            await connection.query(insertUser, realtor, function (error, results, fields) {
              if (error) {
                throw error;
              }
              if (results.affectedRows === 0) {
                console.log(results);
                return res.render('register', {
                  error: 'Your registration has failed.'
                });
              }
              connection.query(updateRole, [1], function (error, update_realtor, fields) {
                if (error) {
                  throw error;
                }
                if (update_realtor.affectedRows === 0) {
                  return res.render('register', {
                    error: 'Registration failed'
                  });
                }
                return res.render('register', {
                  msg: 'You have successfully registered.'
                });
              })
            });
          });
        }
        if (realtor_result.length === 0) {
          await connection.query(findEmail, [body.email], async (error, email_result, fields) => {
            if (error) {
              throw error;
            }
            if (email_result.length !== 0) {
              return res.render('register', {
                error: 'This email already in use. If this is you Login',
              });
            }
            const client = {
              user_name: body.name,
              user_email: body.email,
              user_password: password,
              user_contact: body.contact,
              user_govid: body.govid,
            };

            await connection.query(insertUser, client, function (error, results, fields) {
              if (error) {
                throw error;
              }
              if (results.affectedRows === 0) {
                return res.render('register', {
                  error: 'Your registration has failed.'
                });
              }
              return res.render('register', {
                msg: 'You have successfully registered.'
              });
            });
          });
        }
      })
    }) //end dbconnect
  } catch (error) {
    next(error)
  }

}

module.exports = {
  registerPage,
  registerUser
}
