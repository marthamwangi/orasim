"use strict";
import {
  validationResult
} from 'express-validator';
import bcrypt from 'bcrypt';
import dbconnect from '../config/database.config';
import multer from 'multer';
import path from 'path';
// Home Page
const homePage = async (req, res, next) => {
  await dbconnect.getConnection(function (err, connection) {
    if (err) { throw err }

    console.log('we here')
    console.log(req)
    connection.query("SELECT * FROM client_table WHERE id_client = " + connection.escape(req.session.userID), function (error, results, fields) {
      if (error) { throw error; }
      if (results.length !== 1) {
        return res.redirect('/logout');
      }
      console.log(results)
      res.render('index');

    });
  });
}
const registerClient = async (req, res, next) => {
  const errors = validationResult(req);
  const password = await bcrypt.hash(req.body.password, 10);
  if (!errors.isEmpty()) {
    return res.render('client_register', {
      error: errors.array()[0].msg
    });
  }
  dbconnect.getConnection(async function (err, connection) {
    if (err) {
      throw err
    }
    await connection.query('SELECT * FROM client_table WHERE client_email = ' + connection.escape(req.body.email), async function (error, client_results, fields) {
      if (error) {
        throw error;
      }
      const client = {
        client_name: req.body.name,
        client_email: req.body.email,
        client_password: password,
        client_contact: req.body.contact,
      };
      if (client_results.length !== 0) {
        return res.render('client_register', {
          error: 'This email already already in use. If this is you Login',
        });

      }
      await connection.query('INSERT INTO client_table SET ?', client, function (error, results, fields) {
        if (error) {
          throw error;
        }
        console.log(results)
        if (results.affectedRows === 0) {
          console.log(results);
          return res.render('client_register', {
            error: 'Your registration has failed.'
          });
        }
        res.render("client_register", {
          msg: 'You have successfully registered.'
        });
      });


    });
  });
}
//LOGIN
const loginClient = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('client_login', {
      error: errors.array()[0].msg
    });
  }
  dbconnect.getConnection(async function (err, connecton) {
    if (err) {
      throw err
    }
    await connecton.query('SELECT * FROM client_table WHERE client_email = ' + connecton.escape(req.body.email), async function (error, client_results, fields) {
      if (error) {
        throw error
      }
      if (client_results.length === 1) {
        const comparePassword = await bcrypt.compare(req.body.password, client_results[0].client_password)
        if (comparePassword === true && client_results[0].client_email === req.body.email) {
          req.session.userID = client_results[0].id_client;
          return res.redirect('/client/browse-realtors');
        } else {
          res.render('client_login', {
            error: 'Check your credentials!'
          });
        }
      } res.render('client_login', {
        error: 'Check your credentials!'
      });

    })
  })
}
const getRealtor = async (req, res) => {
  dbconnect.getConnection(await
    function (err, connection) {
      if (err) {
        throw err
      }
      connection.query("SELECT * FROM client_table WHERE id_client = " + connection.escape(req.session.userID), async function (error, client_result, fields) {
        if (error) {
          throw error
        }
        if (client_result.length !== 1) {
          return res.redirect('/client/login');
        }
        await connection.query("SELECT * FROM realtor ", function (error, realtor_result, fields) {
          if (error) {
            throw error;
          }
          if (realtor_result.length === 0) {
            res.render('client_realtor_browse', {
              no_realtor: 'No realtors',

            });
          }
          res.render('client_realtor_browse', {
            yes_realtor: 'Yes realtors',
            realtor: realtor_result,

          });
        });
      });
    })
}
const getSingleRealtor = async (req, res) => {
  dbconnect.getConnection(await
    function (err, connection) {
      if (err) {
        throw err
      }
      connection.query("SELECT * FROM realtor WHERE agentId = " + connection.escape(req.params.agentId), function (error, fetch_realtor, fields) {
        if (error) {
          throw error
        }
        if (fetch_realtor.length !== 1) {
          return res.redirect('/client/browse-realtors');
        }
        res.render('client_view_realtor', {
          realtor: fetch_realtor[0]
        });

      });
    })
}
module.exports = {
  registerClient,
  loginClient,
  homePage,
  getRealtor,
  getSingleRealtor
}
