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
          var data = db.collection('question').find({ 'id' : req.params.questionId }).toArray(function(err, results){
            res.jsonp(results);
            console.log(results);
            console.log(req.params.questionId);
            console.log(typeof(req.params.questionId));
          });

          //res.render(data);
        };
      });
  });


showQuestionRouter.route('/question/:questionId/postAnswer').post((req, res) => {
  const dburl       = 'mongodb://localhost:27017/impuls';
  const questionId  = _.get(req.params, ['questionId']);

  if(_.isNil(questionId)) throw('Req data is invalid');
  mongoClient.connect(dburl, (err, db) => {
    if (err) throw err;

    let answer = db.collection('answer');
    let question = db.collection('question');
    answer.insertOne({ text : req.body.text }, (err, data) => {
      console.log(err, data.insertedId);
      question.update({ id : _.toNumber(req.params.questionId) },{
        $push : { answer_ids : data.insertedId }
      }, (err, result) => {
          if(err) throw (err);
          console.log(result);
          res.send("OK sent");
      });
    });
  });
});

module.exports = showQuestionRouter;
