var _ = require('lodash');
var express = require('express');
var postQuestRouter = express.Router();
var mongoClient = require('mongodb').MongoClient;
const multer = require('multer');
var path = require('path');
const async = require('async');
const upload = multer({ dest: path.join(__dirname, '../uploads/question')});


postQuestRouter.route('/postQuestion')
  .get(function(req, res){
    res.send("Send Form to user");
  });

postQuestRouter.route('/postQuestion/submit').post(upload.single('image'),function (req, res){
      const dict = {};
      async.waterfall([
        //connect database
        (flowCallback)=> {
          let url = 'mongodb://localhost:27017/impuls';
          mongoClient.connect(url, function (err, db) {
            if (err) return flowCallback (err);
            dict.db = db;
            return flowCallback();
          });
        },
        (flowCallback)=> {
          //url opened successfully
          //insert the data
          dict.dbquestion = dict.db.collection('question');
          dict.dbimage = dict.db.collection('image');
          var qtitle = _.get(req, ['body', 'title'], null);
          var qbody = _.get(req, ['body', 'questionbody'], null);
          const chptr = _.get(req,['body','chapter'],'');
          const sbjct = _.get(req,['body','subject'],'');
          var targetPath = _.get(req,['file','path'], null);
          var image_id = null;
          if (targetPath!=null) {
            //there is an image
            dict.dbimage.insertOne({"path" : targetPath}, (err,dataimage) => {
              if (err) {
                image_id = null;
              } else {
                image_id = dataimage.insertedId;
              }
              console.log(image_id);
              const data = {'title' : qtitle, 'text' : qbody,'image' : image_id ,'answer_ids' : [], 'subject_ids' : sbjct.split(', '), 'chapter_ids' : chptr.split(', ') };
              dict.dbquestion.insertOne(data, (err, result) => {
                if (err) return flowCallback(err);
                return flowCallback();
              });
            });
          } else {
            //there is no image
            image_id = null;
            console.log(image_id);
            const data = {'title' : qtitle, 'text' : qbody,'image' : image_id ,'answer_ids' : [], 'subject_ids' : sbjct.split(', '), 'chapter_ids' : chptr.split(', ') };
            dict.dbquestion.insertOne(data, function (err, result) {
              if (err) return flowCallback(err);
              return flowCallback();
            });
          }
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
