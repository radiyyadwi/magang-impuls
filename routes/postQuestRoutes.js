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
      var qtitle = req.body('title');
      var qbody = req.body('question-body');
      const data = {'id' : 1, 'title' : qtitle, 'text' : qbody, 'answer_ids' : [], 'subject_ids' : [], 'chapter_ids' : [] };
        collection.insertOne(data, function (err, result) {
          res.send(result);
          db.close();
        });
      });
  });


module.exports = postQuestRouter;
