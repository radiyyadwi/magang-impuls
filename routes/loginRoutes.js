
const express = require('express');
const _ = require('lodash');
const mongoClient = require('mongodb').MongoClient;
const async = require('async');
const loginRouter = express.Router();


loginRouter.route('/login').get((req, res) => {
  return res.status(200).json({
    task    : "show login page",
    status  : "OK",
    message : "page loaded",
    data    : {}
  });
});

loginRouter.route('/login/authMe').post((req, res) => {
  const dburl       = 'mongodb://localhost:27017/impuls';
  const dict = {};
  const dict.username    = req.body.username;
  const dict.passwd      = req.body.password;
  async.waterfall([
    (flowCallback) =>{
      mongoClient.connect(dburl, (err, db) => {
        if (err) return flowCallback(err);
        dict.db = db;
        return flowCallback();
      });
    },
    (flowCallback) =>{
      dict.dbuser = dict.db.collection('user');
      dict.dbuser.find({ username : dict.username, password : dict.password}, (error, results) => {
        if (error) return flowCallback(error);
        if(_.isNil(results)) {
          return flowCallback('Username atau password salah');
        } else {
          dict.user = results;
          return flowCallback();
        }
      });
    }
  ], (err, result) => {
    !_.isNil(dict.db) && dict.db.close();
    if (err) {
      return res.status(400).json({
        task    : "Auth login with username and password",
        status  : "FAILED",
        message : err
      });
    } else {
      return res.status(200).json({
        task    : "Auth login with username and password",
        status  : "OK",
        message : "Success",
        data    : { user: dict.user }
      });
    }
  });
});

module.exports = loginRouter;
