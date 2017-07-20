var express = require('express');
var showQuestionRouter = express.Router();
var mongoClient = require('mongodb').MongoClient

shoQuestionRouter.route('/question')
  .get('/' + questionId, function(req, res){
      // show question with question id
      mongoClient.connect('mongodb://localhost:27017/impuls', function(err, db){
        if (err) throw err;
        else{
          var data = db.question.find({ 'id' : questionId });
          res.send('data showed');
          //res.render(data);
        };
      });
  });
  .get('/' + questionId + '/postAnswer', function(req, res){
    res.send('show answer form');
  });

module.exports = showQuestionRouter;
