var _ = require('lodash');
var express = require('express');
var postQuestRouter = express.Router();
var mongoClient = require('mongodb').MongoClient;
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });


postQuestRouter.route('/createPost')
  .get(function(req, res){
    res.send("Send Form to user");
  });

  postQuestRouter.route('/createPost/submit')
    .post(upload.single(),function (req, res){
      let url = 'mongodb://localhost:27017/impuls';
      mongoClient.connect(url, function (err, db) {
        let collection = db.collection('question');
        var qtitle =  _.get(req.body, ['title'], 'Isian Kosong');
        var qbody = req.body.questionbody;

        //image uploader
        var tempPath = req.files.image.path;
        console.log(tempPath);
        var targetPath = path.resolve('./uploads/image.png');
        if (path.extname(req.files.image.name).toLowerCase() === '.png') {
          fs.rename(tempPath, targetPath, function(err) {
            if (err) throw err;
            console.log("Upload file completed!");
        });
        } else {
          fs.unlink(tempPath, function () {
            if (err) throw err;
            console.error("Only .png files are allowed!");
          });
        }
        const data = {'id' : 1, 'title' : qtitle, 'text' : qbody,'image' : targetPath ,'answer_ids' : [], 'subject_ids' : [], 'chapter_ids' : [] };
          collection.insertOne(data, function (err, result) {
            res.send("question submitted");

            db.close();
          });
        });
    });


module.exports = postQuestRouter;
