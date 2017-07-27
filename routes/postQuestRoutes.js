var _ = require('lodash');
var express = require('express');
var postQuestRouter = express.Router();
var mongoClient = require('mongodb').MongoClient;


postQuestRouter.route('/createPost')
  .get(function(req, res){
    res.send("Send Form to user");
  });

postQuestRouter.route('/createPost/submit')
  .post(function (req, res){
    let url = 'mongodb://localhost:27017/impuls';
    console.log(req.body);
    mongoClient.connect(url, function (err, db) {
      let collection = db.collection('question');
      const qtitle =  _.get(req.body, ['title'], 'Isian Kosong');
      const qbody = _.get(req.body, ['questionbody'], 'Isian Kosong');
      const chptr = _.get(req.body, ['chapter'], ' ');
      const sbjct = _.get(req.body, ['subject'], ' ');
      const date = _.now();
      const data = { title : qtitle, text : qbody, answer_ids : [], subject_ids : sbjct.split(', ') , chapter_ids : chptr.split(', ') , time : date };
        collection.insertOne(data, function (err, result) {
          res.send("question submitted");
          db.close();
        });
      });
  });


module.exports = postQuestRouter;
