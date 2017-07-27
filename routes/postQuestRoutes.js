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
          var question = dict.db.collection('question');
          var qtitle = _.get(req, ['body', 'title'], null);
          var qbody = _.get(req, ['body', 'questionbody'], null);
          var targetPath = _.get(req,['file','path'], null);
          const chptr = _.get(req,['body','chapter'],'');
          const sbjct = _.get(req,['body','subject'],'');
          const data = {'title' : qtitle, 'text' : qbody,'image' : targetPath ,'answer_ids' : [], 'subject_ids' : sbjct.split(', '), 'chapter_ids' : chptr.split(', ') };
          question.insertOne(data, function (err, result) {
          res.send({"status" : "question submitted",
                    "judul" : req.body.title,
                    "image" : req.file.originalname,
                    "chapter" : req.body.chapter,
                    "subject" : req.body.subject
                  });
          console.log(req.file);
          console.log(req.body);
          dict.db.close();
          })
        }
      ])

  });

module.exports = postQuestRouter;
