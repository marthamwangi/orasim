"use strict";
import {
  validationResult
} from 'express-validator';
import bcrypt from 'bcrypt';
import dbconnect from '../config/database.config';
import multer from 'multer';
import path from 'path';

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
        console.log(comparePassword)

        if (comparePassword === true && client_results[0].client_email === req.body.email) {
          req.session.UserID = client_results[0].id_client;
          console.log(req.session)
          res.render('index', {
            client: client_results[0],
          });
        }
      }
      else {
        res.render('client_login', {
          error: 'Check your credentials!'
        });
      }
    })
  })
}


module.exports = {
  registerClient,
  loginClient
}
