var express = require('express');
var postQuestRouter = express.Router();
var mongoClient = require('mongodb').MongoClient;

postQuestRouter.route('/createPost')
  .get(function(req, res){
    res.send("OK");
  });
  .post('/submit', function (req, res) {
    mongoClient.connect('mongodb://localhost:27017/impuls', function (err, db) {
      if (err) throw err;
      else{
        db.collection('post').insertOne( "id" : 1, "title" : req.body('title'), text : req.body('text'), date : , 'answer_ids' : [], 'subject_ids' : [], 'chapter_ids' : []);
        res.send('question submitted');
      };
    })
  })


module.exports = postQuestRouter;
