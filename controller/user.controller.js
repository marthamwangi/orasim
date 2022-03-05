"use strict";
import {
  validationResult
} from 'express-validator';
import bcrypt from 'bcrypt';
import dbconnect from '../config/database.config';
//HOMEPAGE
const homePage = async (req, res, next) => {
  try {
    await dbconnect.getConnection(async (err, connection) => {
      await connection.query('SELECT * FROM users_table WHERE id_user = ' + connection.escape(req.session.userID), function (error, user_result, fields) {
        if (error) {
          throw error
        }
        if (user_result.length !== 1) {
          return res.redirect('/logout');
        }
        res.render('index', {
          user: user_result[0]
        })
      })
    })
  } catch (error) {

  }
}
//REGISTER
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
//LOGIN
const loginPage = (req, res, next) => {
  res.render("login")
}
const loginUser = (req, res) => {
  const errors = validationResult(req);
  const { body } = req;
  if (!errors.isEmpty()) {
    return res.render('login', {
      error: errors.array()[0].msg
    });
  }
  try {
    dbconnect.getConnection(async function (err, connecton) {
      if (err) {
        throw err
      }
      await connecton.query('SELECT * FROM users_table WHERE user_email = ' + connecton.escape(body.email), async function (error, login_results, fields) {
        if (error) {
          throw error
        }
        if (login_results.length === 1) {
          const comparePassword = await bcrypt.compare(body.password, login_results[0].user_password)
          if (comparePassword === true && login_results[0].user_email === body.email) {
            req.session.userID = login_results[0].id_user;
            return res.redirect('/');
          } else {
            res.render('login', {
              error: 'Check your credentials!'
            });
          }
        } res.render('login', {
          error: 'Check your credentials!'
        });

      })
    })
  } catch (error) {
    next(error)
  }
}
//BROWSE REALTORS
const browseRealtors = async (req, res) => {
  dbconnect.getConnection(await
    function (err, connection) {
      if (err) {
        throw err
      }
      connection.query("SELECT * FROM users_table WHERE id_user = " + connection.escape(req.session.userID), async function (error, user_result, fields) {
        if (error) {
          throw error
        }
        if (user_result.length !== 1) {
          return res.redirect('/login');
        }
        await connection.query("SELECT * FROM users_table WHERE user_role = " + connection.escape(1), function (error, realtor_result, fields) {
          if (error) {
            throw error;
          }
          if (realtor_result.length === 0) {
            res.render('browse-realtors', {
              no_realtor: 'No realtors',

            });
          }
          res.render('browse-realtors', {
            yes_realtor: 'Yes realtors',
            realtor: realtor_result,
            user: user_result[0]
          });
        });
      });
    })
}
const searchRealtors = async (req, res) => {
  const { realtor } = req.query
  dbconnect.getConnection(await function (err, connection) {
    if (err) {
      throw err
    }
    connection.query('SELECT users_table ')
  })
}
module.exports = {
  homePage,
  registerPage,
  registerUser,
  loginPage,
  loginUser,
  browseRealtors,
  searchRealtors

}
