var _ = require('lodash');
var express = require('express');
var showAnswerRouter = express.Router();
var mongoClient = require('mongodb').MongoClient;
const objectId = require('mongodb').ObjectId;

showAnswerRouter.route('/answer/:answerId')
  .get(function(req, res){
      // show question with question id
      mongoClient.connect('mongodb://localhost:27017/impuls', function(err, db){
        if (err) throw err;
        else{
          var data = db.collection('answer').find({ _id : objectId(req.params.answerId) }).toArray(function(err, results){
          res.jsonp(results);
          });
        };
      });
  });

module.exports = showAnswerRouter;
