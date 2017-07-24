const express = require('express');
let postAnswerRouter = express.Router();
let mongoClient = require('mongodb').MongoClient;

postAnswerRouter.route('/post-answer/submit')
  .post( function(req, res)
    const dburl = 'mongodb://localhost:27017/impuls';
    mongoClient.connect(dburl, function(err, db){
      if (err) throw err;
      else{
        let answer = db.collection('answer');
        answer.insertOne({ 'text' : req.body.answerbody, 'images' : [req.body('image1')]})
      }
  })
