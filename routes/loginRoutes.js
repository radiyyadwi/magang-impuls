
const express = require('express');
const _ = require('lodash');
const mongoClient = require('mongodb').MongoClient;
const async = require('async');
const loginRouter = express.Router();
const crypto = require('crypto');


loginRouter.route('/login').get((req, res) => {
  return res.status(200).json({
    task    : "show login page",
    status  : "OK",
    message : "page loaded",
    data    : {}
  });
});

loginRouter.route('/login/authMe').post((req, res) => {
  const dburl = 'mongodb://localhost:27017/impuls';
  const dict = {};
  dict.username     = req.body.username;
  dict.password      = req.body.password;
  async.waterfall([
    (flowCallback) =>{
      mongoClient.connect(dburl, (err, db) => {
        if (err) return flowCallback(err);
        dict.db = db;
        return flowCallback();
      });
    },
    (flowCallback) =>{
      dict.dbuser = dict.db.collection('account');
      var hash = crypto.createHmac('sha512','12peJeMaHO021997');
      hash.update(dict.password);
      dict.password = hash.digest('hex');
      dict.dbuser.findOne({ username: dict.username, password: dict.password}, (error, results) => {
        if (error) return flowCallback(error);
        if(_.isNil(results)) {
          return flowCallback('Username atau password salah');
        }
        dict.user = results._id;
        return flowCallback();
      });
    }
  ], (err,results) => {
    !_.isNil(dict.db) && dict.db.close();
    if (err) {
      return res.status(400).json({
        task: "Auth login with username and password",
        status: "FAILED",
        message: err
      });
    } else {
      //console.log(results);
      return res.status(200).json({
        task: "Auth login with username and password",
        status: "OK",
        message: "Success",
        data: { account_id: dict.user }
      });
    }
  });
});

module.exports = loginRouter;
