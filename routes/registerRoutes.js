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
      const name = _.get(req,['body', 'name'], null);
      const email = _.get(req,['body', 'email'], null);
      if (!validator.validate(email)) return flowCallback('Email not valid');
      const data = {'prof-pic' : dict.pic_id, 'name' : name, 'email' : email};
      dict.dbaccount.insertOne(data, (err,result) => {
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
