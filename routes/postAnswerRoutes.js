const express = require('express');
let postAnswerRouter = express.Router();
let mongoClient = require('mongodb').MongoClient;

postQuestionRouter.route('/post-answer')
  .post('/submit', function(req, res) {
    mongoClient.connect('mongodb://localhost:27017/impuls', function(err, db){
      if (err) throw err;
      else{
        db.answer.insertOne({ 'id' : , 'date' : , vote})
      }
  })
