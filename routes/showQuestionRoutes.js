var express = require('express');
var showQuestionRouter = express.Router();
var mongoClient = require('mongodb').MongoClient

showQuestionRouter.route('/question/:questionId')
  .get(function(req, res){
      // show question with question id
      mongoClient.connect('mongodb://localhost:27017/impuls', function(err, db){
        if (err) throw err;
        else{
          var data = db.question.find({ 'id' : req.params('questionId') });
          res.send('data showed');
          //res.render(data);
        };
      });
  });


showQuestionRouter.route('/question/:questionId/postAnswer')
  .get(function(req, res){
    res.send('show answer form');
  });

module.exports = showQuestionRouter;
