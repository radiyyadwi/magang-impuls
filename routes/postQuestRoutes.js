var _ = require('lodash');
var express = require('express');
var postQuestRouter = express.Router();
var mongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectId;
const multer = require('multer');
var path = require('path');
const async = require('async');
const upload = multer({ dest: path.join(__dirname, '../uploads/question')});


postQuestRouter.route('/postQuestion')
  .get(function(req, res){
    res.send("Send Form to user");
  });

postQuestRouter.route('/postQuestion/submit').post(upload.array('image', 3),function (req, res){
      const dict = {};
      async.waterfall([
        //connect database
        (flowCallback)=> {
          let url = 'mongodb://localhost:27017/impuls';
          mongoClient.connect(url, function (err, db) {
            if (err) return flowCallback (err);
            dict.db = db;
            dict.dbquestion = dict.db.collection('question');
            dict.dbimage = dict.db.collection('image');
            return flowCallback();
          });
        },
        (flowCallback)=> {
          dict.image_ids = [];
          async.each(req.files, (item, next) => {
            const img_path = _.get(item, ['path'], null);
            if (_.isNil(img_path)) return next();
            dict.dbimage.insertOne({"path" : img_path}, (err,dataimage) => {
              if (err) return next(err);
              image_id = dataimage.insertedId;
              dict.image_ids.push(image_id);
              return next();
            });
          }, flowCallback);
        },
        (flowCallback)=> {
          //url opened successfully
          //insert the data
          console.log(req.files);
          const qtitle = _.get(req, ['body', 'title'], null);
          const qbody = _.get(req, ['body', 'questionbody'], null);
          const chptr = _.get(req,['body','chapter'],'');
          const sbjct = _.get(req,['body','subject'],'');
          const data = {'title' : qtitle, 'text' : qbody,'image_ids' : dict.image_ids,'answer_ids' : [], 'subject_ids' : sbjct.split(', '), 'chapter_ids' : chptr.split(', ') };
          dict.dbquestion.insertOne(data, (err, result) => {
            if (err) return flowCallback(err);
            return flowCallback();
          });
        }
      ], (err, results) => {
        !_.isNil(dict.db) && dict.db.close();
        if (err) {
          return res.status(400).json({
            task: "Insert answer by question ID",
            status: "FAILED",
            message: err
          });
        } else {
          return res.status(200).json({
            task: "Insert answer by question ID",
            status: "OK",
            message: "Success",
            data: { answer_id: dict.newId }
          });
        }
      });
    });

module.exports = postQuestRouter;
