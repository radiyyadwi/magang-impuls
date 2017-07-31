var _ = require('lodash');
const express = require('express');
let postAnswerRouter = express.Router();
let mongoClient = require('mongodb').MongoClient;
const async = require('async');
const objectId = require('mongodb').ObjectId;
const isValidId = require('mongodb').ObjectId.isValid;
const multer = require('multer');
var path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads/answer')});


// postAnswerRouter.route('/post-answer/submit')
//   .post( function(req, res)
//     const dburl = 'mongodb://localhost:27017/impuls';
//     mongoClient.connect(dburl, function(err, db){
//       if (err) throw err;
//       else{
//         let answer = db.collection('answer');
//         answer.insertOne({ 'text' : req.body.answerbody, 'images' : [req.body('image1')]})
//       }
//   })

postAnswerRouter.route('/question/:questionId/postAnswer').post(upload.single('image'), (req, res) => {
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
        dict.answer = dict.db.collection('answer');
        dict.dbimage = dict.db.collection('image');
        var text = req.body.text;
        dict.question.findOne({ _id : objectId(questionId)}, (error, results) => {
          if (error) return flowCallback(error);
          if (_.isNil(results)) {
            return flowCallback('Question not found');
          } else {
            var targetPath = _.get(req,['file','path'], null);
            var image_id = null;
            if (targetPath!=null) {
              //there is an image
              dict.dbimage.insertOne({"path" : targetPath}, (err,dataimage) => {
                if (err) {
                  image_id = null;
                } else {
                  image_id = dataimage.insertedId;
                }
                const data = {'text' : text,'image' : image_id};
                dict.answer.insertOne(data, (err, result) => {
                  if (err) return flowCallback(err);
                  dict.newId = result.insertedId;
                  return flowCallback();
                });
              });
            } else {
                //there is no image
                const data = {'text' : text,'image' : image_id};
                dict.answer.insertOne(data, (err, result) => {
                  if (err) return flowCallback(err);
                  dict.newId = result.insertedId;
                  return flowCallback();
                });
              }
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

module.exports = postAnswerRouter;
