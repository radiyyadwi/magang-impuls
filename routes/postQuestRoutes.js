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
          var question = dict.db.collection('question');
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
              question.insertOne(data, function (err, result) {
              res.jsonp(result);
              });
            })
          } else {
            //there is no image
            console.log(image_id);
            const data = {'title' : qtitle, 'text' : qbody,'image' : image_id ,'answer_ids' : [], 'subject_ids' : sbjct.split(', '), 'chapter_ids' : chptr.split(', ') };
            question.insertOne(data, function (err, result) {
            res.jsonp(result);
            });
          }
          dict.db.close();
          }
      ])
  });

module.exports = postQuestRouter;
