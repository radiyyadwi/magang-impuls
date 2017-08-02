const _ = require('lodash');
const express = require('express');
const postAnswerRouter = express.Router();
const mongoClient = require('mongodb').MongoClient;
const async = require('async');
const objectId = require('mongodb').ObjectId;
const isValidId = require('mongodb').ObjectId.isValid;
const multer = require('multer');
var path = require('path');
const upload = multer({ dest: path.join(__dirname, '../uploads/answer')});

postAnswerRouter.route('/question/:questionId/postAnswer').post(upload.array('image', 3), (req, res) => {
    const dburl       = 'mongodb://localhost:27017/impuls';
    const questionId  = _.get(req.params, ['questionId']);

    let dict = {};
    async.waterfall([
      (flowCallback) => {
        if(_.isNil(questionId) || !(isValidId(questionId))) return flowCallback('Req data is invalid');
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
        dict.dbanswer   = dict.db.collection('answer');
        dict.dbquestion = dict.db.collection('question');
        dict.dbimage = dict.db.collection('image');
        dict.dbquestion.findOne({ _id : objectId(questionId)}, (error, results) => {
          if (error) return flowCallback(error);
          if (_.isNil(results)) {
            return flowCallback('Question not found');
          } else {
            return flowCallback();
          }
        });
      },
      (flowCallback)=> {
        dict.image_ids = [];
        async.each(req.files, (item, next) => {
          const img_path = _.get(item, ['path'], null);
          if (_.isNil(img_path)) return next();
          dict.dbimage.insertOne({"path" : img_path}, (err,dataimage) => {
            if (err) return next(err);
            image_id = dataimage.insertedId;
            dict.image_ids.push(image_id);
            return next();
          });
        }, flowCallback);
      },
      (flowCallback)=> {
        //url opened successfully
        //insert the data
        console.log(req.files);
        const text = _.get(req, ['body', 'text'], null);
        const data = {'text' : text, 'image_ids' : dict.image_ids};
        dict.dbanswer.insertOne(data, (err, result) => {
          if (err) return flowCallback(err);
          dict.newId = result.insertedId;
          return flowCallback();
        });
        //     var targetPath = _.get(req,['file','path'], null);
        //     var image_id = null;
        //     if (targetPath!=null) {
        //       //there is an image
        //       dict.dbimage.insertOne({"path" : targetPath}, (err,dataimage) => {
        //         if (err) {
        //           image_id = null;
        //         } else {
        //           image_id = dataimage.insertedId;
        //         }
        //         const data = {'text' : text,'image' : image_id};
        //         dict.dbanswer.insertOne(data, (err, result) => {
        //           if (err) return flowCallback(err);
        //           dict.newId = result.insertedId;
        //           return flowCallback();
        //         });
        //       });
        //     }
        //   }
        // });
      },
      (flowCallback) => {
        //push answer to answer_ids
        dict.dbquestion.update({ _id : objectId(questionId) },{
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
          task    : "Insert answer by question ID",
          status  : "FAILED",
          message : err
        });
      } else {
        return res.status(200).json({
          task    : "Insert answer by question ID",
          status  : "OK",
          message : "Success",
          data    : { answer_id: dict.newId }
        });
      }
    });
  });

module.exports = postAnswerRouter;
