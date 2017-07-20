var _ = require('lodash');
var express = require('express');
var showQuestionRouter = express.Router();
var mongoClient = require('mongodb').MongoClient

showQuestionRouter.route('/question/:questionId')
  .get(function(req, res){
      // show question with question id
      mongoClient.connect('mongodb://localhost:27017/impuls', function(err, db){
        if (err) throw err;
        else{
          var data = db.collection('question').find({ 'id' : _.toNumber(req.params.questionId) }).toArray(function(err, results){
            res.jsonp(results);
            console.log(results);
            console.log(req.params.questionId);
          });

          //res.render(data);
        };
      });
  });


showQuestionRouter.route('/question/:questionId/postAnswer')
  .get(function(req, res){
    res.send('show answer form');
  });

module.exports = showQuestionRouter;
