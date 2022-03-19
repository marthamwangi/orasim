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
    next(error)
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
      var findEmail = 'SELECT * FROM users_table WHERE user_email = ?';
      var insertUser = 'INSERT INTO users_table SET ?'
      await connection.query(findEmail, [body.email], async (error, email_result, fields) => {
        if (error) {
          throw error;
        }
        if (email_result.length !== 0) {
          return res.render('register', {
            error: 'This email already in use. If this is you Login',
          });
        }

        const user = {
          user_name: body.name,
          user_email: body.email,
          user_password: password,
          user_contact: body.contact,
        };

        await connection.query(insertUser, user, function (error, results, fields) {
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
        if (login_results.length === 0) {
          return res.render('login', {
            error: 'Invalid email address'
          });
        }
        const comparePassword = await bcrypt.compare(body.password, login_results[0].user_password);
        if (comparePassword === true && login_results[0].user_role == 0) {
          req.session.userID = login_results[0].id_user;
          return res.redirect('/admin');

        } else if (comparePassword === true && login_results[0].user_role != 0) {
          req.session.userID = login_results[0].id_user;
          return res.redirect('/');
        }
        res.render('login', {
          error: 'Invalid password!'
        });
      });
    })

  } catch (error) {
    next(error)
  }
}
const resetPasswordPage = (req, res, next) => {
  res.render("reset-password")
}
const resetPassword = async (req, res, next) => {
  const { body } = req;
  try {
    dbconnect.getConnection(async function (err, connecton) {
      if (err) {
        throw err
      }
      await connecton.query('SELECT * FROM users_table WHERE user_email = ' + connecton.escape(body.email), async function (error, email_results, fields) {
        if (error) {
          throw error
        }
        if (email_results.length === 0) {
          return res.render('reset-password', {
            error: 'This email does not exist for a PORES user'
          });
        }
        res.render('reset-password', {
          msg: 'We have sent a reset password email in your accout.'
        });
      });
    })

  } catch (error) {
    next(error)
  }
}
//SETTING
const profileSettingPage = (req, res, next) => {
  res.render("profile")
}
//ADMIN
const adminDashboard = async (req, res) => {
  try {
    await dbconnect.getConnection(async (err, connection) => {
      await connection.query('SELECT * FROM users_table WHERE id_user = ' + connection.escape(req.session.userID), async function (error, user_result, fields) {
        if (error) {
          throw error
        }
        if (user_result.length !== 1) {
          return res.redirect('/logout');
        }
        await connection.query('SELECT * FROM users_table WHERE id_user != ' + connection.escape(req.session.userID), async function (error, all_users, fields) {
          if (error) {
            throw error
          }
          if (user_result) {
            return res.render('admin', {
              user: user_result,
              all_users: all_users,
              success: 'User Updated successfully'
            })
          }
        })
      })
    })
  } catch (error) {
    next(error)
  }
}
const addUser = (req, res, next) => {
  res.render('add-user')
}
const getUser = async (req, res) => {
  console.log('i was called')
  try {
    await dbconnect.getConnection(async (err, connection) => {
      await connection.query('SELECT * FROM users_table WHERE id_user = ' + connection.escape(req.params.id), async function (error, get_user, fields) {
        if (error) {
          throw error
        }
        console.log(get_user);
        res.json(get_user)
      })
    })
  } catch (error) {
    next(error)
  }
}
const deleteUser = async (req, res) => {
  try {
    await dbconnect.getConnection(async (err, connection) => {
      await connection.query('DELETE FROM users_table WHERE id_user = ' + connection.escape(req.params.id), async function (error, delete_user, fields) {
        if (error) {
          throw error
        }
        // console.log(delete_user);
        res.send({ message: `user was deleted successfully!` });
      })
    })
  } catch (error) {
    next(error)
  }
}
const updateUser = async (req, res) => {
  try {
    await dbconnect.getConnection(async (err, connection) => {
      await connection.query('UPDATE users_table SET user_name = ' + connection.escape(req.body.editFullNameModal) + ', user_email = ' + connection.escape(req.body.editEmailModal) + ', user_contact = ' + connection.escape(req.body.editPhoneModal) + ', user_role = ' + connection.escape(req.body.editUserModalRoleModalRadio) + ' WHERE id_user = ' + connection.escape(req.params.id), async function (error, updated_user, fields) {
        if (error) {
          throw error
        }
        // console.log(updated_user.affectedRows);
        res.redirect('/admin')
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
        await connection.query("SELECT * FROM users_table WHERE user_role = " + connection.escape(1) + " AND license_status = 1 ", function (error, realtor_result, fields) {
          if (error) {
            throw error;
          }
          res.render('browse-realtors', {
            realtor: realtor_result,
            user: user_result[0]
          });
        });
      });
    })
}
const postListingPage = (req, res, next) => {
  try {
    dbconnect.getConnection(async (err, connection) => {
      await connection.query('SELECT * FROM users_table WHERE id_user = ' + connection.escape(req.session.userID), function (error, user_result, fields) {
        if (error) {
          throw error
        }
        if (user_result.length !== 1) {
          return res.redirect('/logout');
        }
        res.render('post-listing', {
          user: user_result[0]
        })
      })
    })
  } catch (error) {
    next(error)
  }
}
const postListing = async (req, res, next) => {

}
const browseProperties = (req, res, next) => {
  res.render("browse-properties")
}
const propertyOverview = (req, res, next) => {
  res.render("property-overview")
}
const getSingleRealtor = async (req, res) => {
  dbconnect.getConnection(await
    async function (err, connection) {
      if (err) {
        throw err
      }
      await connection.query("SELECT * FROM users_table WHERE id_user = " + connection.escape(req.session.userID), async function (error, user_result, fields) {
        if (error) {
          throw error
        }
        if (user_result.length !== 1) {
          return res.redirect('/login');
        }
        connection.query("SELECT * FROM users_table WHERE id_user = " + connection.escape(req.params.realtorId), function (error, fetch_realtor, fields) {
          if (error) {
            throw error
          }
          if (fetch_realtor.length !== 1) {
            return res.redirect('/browse-realtors');
          }
          res.render('hire-realtor', {
            user: user_result[0],
            realtor: fetch_realtor[0]
          });

        });
      })
    })
}
const hireRealtor = async (req, res) => {
  const { body } = req;
  dbconnect.getConnection(await
    async function (err, connection) {
      if (err) {
        throw err
      }
      await connection.query("SELECT * FROM users_table WHERE id_user = " + connection.escape(req.session.userID), async function (error, user_result, fields) {
        if (error) {
          throw error
        }
        if (user_result.length !== 1) {
          return res.redirect('/login');
        }
        const requirement = {
          specialty: body.specialty,
          region: body.region,
          property_type: body.propertyType,
          beds: body.beds,
          baths: body.baths,
          min_price: body.minPrice,
          max_price: body.maxPrice,
          description: body.description,
          realtor_id: req.params.realtorId,
          client_id: req.session.userID
        }
        await connection.query("INSERT INTO hires_table SET ?", requirement, function (error, results, fields) {
          if (error) {
            throw error;
          }
          return res.render('hire-realtor', {
            msg: 'Successful.'
          });
        })
      })
    })
}
module.exports = {
  homePage,
  profileSettingPage,
  adminDashboard,
  registerPage,
  registerUser,
  loginPage,
  loginUser,
  resetPasswordPage,
  resetPassword,
  postListingPage,
  postListing,
  browseRealtors,
  propertyOverview,
  browseProperties,
  addUser,
  getUser,
  getSingleRealtor,
  hireRealtor,
  deleteUser,
  updateUser

}
