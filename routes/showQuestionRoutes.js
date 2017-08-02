var _ = require('lodash');
var express = require('express');
var showQuestionRouter = express.Router();
var mongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectId;


showQuestionRouter.route('/question/:questionId')
  .get(function(req, res){
      // show question with question id
      mongoClient.connect('mongodb://localhost:27017/impuls', function(err, db){
        if (err) throw err;
        else{
          var data = db.collection('question').find({ _id : objectId(req.params.questionId) }).toArray(function(err, results){
            res.jsonp(results);
          });
        };
      });
  });

module.exports = showQuestionRouter;
