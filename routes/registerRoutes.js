var _ = require('lodash');
var express = require('express');
var registerRouter = express.Router();
var mongoClient = require('mongodb').MongoClient;
const multer = require('multer');
var path = require('path');
const async = require('async');
const upload = multer({ dest: path.join(__dirname, '../uploads/profile-picture')});
const validator = require('email-validator');

registerRouter.route('/register').post(upload.single('prof-pic'),(req,res) => {
  const dict = [];
  async.waterfall([
    (flowCallback) => {
      let url = 'mongodb://localhost:27017/impuls';
      mongoClient.connect(url, function (err, db) {
        if (err) return flowCallback (err);
        dict.db = db;
        dict.dbaccount = dict.db.collection('account');
        dict.dbquestion = dict.db.collection('question');
        dict.dbanswer = dict.db.collection('answer');
        dict.dbimage = dict.db.collection('image');
        return flowCallback();
      });
    },
    (flowCallback)=> {
      const pic_path = _.get(req,['file', 'path'], null);
      if (_.isNil(pic_path)) {
        dict.pic_id = null;
      } else {
        dict.dbimage.insertOne({"path" : pic_path}, (err,dataimage) => {
        if (err) return flowCallback(err);
        dict.pic_id = dataimage.insertedId;
        });
      }
      return flowCallback();
    },
    (flowCallback)=> {
      //move req.body to global var
      dict.username = _.get(req,['body', 'username'], null);
      dict.email = _.get(req,['body', 'email'], null);
      const password = _.get(req,['body','password'], null);
      if (!validator.validate(dict.email)) return flowCallback('Email not valid');
      dict.data = {'prof-pic' : dict.pic_id, 'username' : dict.username, 'email' : dict.email, 'password' : password};
      return flowCallback();
    },
    (flowCallback)=> {
      // check the username in database first
      dict.dbaccount.findOne({'username': dict.username}, (err,result) => {
        if (err) return flowCallback(err);
        if (!_.isNil(result)) return flowCallback("Username sudah terdaftar");
        return flowCallback();
      })
    },
    (flowCallback)=> {
      //// check the email in database first
      dict.dbaccount.findOne({'email': dict.email}, (err,result) => {
        if (err) return flowCallback(err);
        if (!_.isNil(result)) return flowCallback("Email sudah terdaftar");
        return flowCallback();
      })
    },
    (flowCallback) => {
      console.log(dict.data);
      dict.dbaccount.insertOne(dict.data, (err,result) => {
        if (err) return flowCallback(err);
        dict.accountid = result.insertedId;
        return flowCallback();
      })
    }
  ], (err,results) => {
    !_.isNil(dict.db) && dict.db.close();
    if (err) {
      return res.status(400).json({
        task: "Register Account",
        status: "FAILED",
        message: err
      });
    } else {
      return res.status(200).json({
        task: "Register Account",
        status: "OK",
        message: "Success",
        data: { account_id: dict.accountid }
      });
    }
  });
});

module.exports = registerRouter;
