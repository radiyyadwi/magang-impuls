var _ = require('lodash');
var express = require('express');
var showQuestionRouter = express.Router();
var mongoClient = require('mongodb').MongoClient
const objectId = require('mongodb').ObjectId
const isValidId = require('mongodb').ObjectId.isValid;
const async = require('async');


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


showQuestionRouter.route('/question/:questionId/postAnswer').post((req, res) => {
  const dburl       = 'mongodb://localhost:27017/impuls';
  const questionId  = _.get(req.params, ['questionId']);

  let dict = {};
  async.waterfall([
    (flowCallback) => {
      if(_.isNil(questionId) || !(isValidId(questionId))) return flowCallback('Req data is invalid');
      console.log(isValidId(questionId));
      return flowCallback(null);
    },
    (flowCallback) => {
      mongoClient.connect(dburl, (err, db) => {
        if (err) return flowCallback(err);
        dict.db = db;
        return flowCallback();
      });
    },
    (flowCallback) => {
      dict.answer   = dict.db.collection('answer');
      dict.question = dict.db.collection('question');

      dict.question.findOne({ _id : objectId(questionId)}, (error, results) => {
        if (error) return flowCallback(error);
        if (_.isNil(results)) {
          return flowCallback('Question not found');
        } else {
          dict.answer.insertOne({ text : req.body.text }, (err, data) => {
            if (err) return flowCallback(err);
            dict.newId = data.insertedId;
            return flowCallback();
          });
        }
      });
    },
    (flowCallback) => {
      dict.question.update({ _id : objectId(questionId) },{
        $push : { answer_ids : dict.newId }
      }, (err, result) => {
        if (err) return flowCallback(err);
        return flowCallback();
      });
    }
  ], (err, results) => {
    !_.isNil(dict.db) && dict.db.close();

    if (err) {
      return res.status(400).json({
        task: "Insert answer by question ID",
        status: "FAILED",
        message: err
      });
    } else {
      return res.status(200).json({
        task: "Insert answer by question ID",
        status: "OK",
        message: "Success",
        data: { answer_id: dict.newId }
      });
    }
  });
});

module.exports = showQuestionRouter;
