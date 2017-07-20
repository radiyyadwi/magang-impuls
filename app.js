var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoClient = require('mongodb').mongoClient;
var postQuestRouter = require('./routes/postQuestRoutes');
var showQuestionRouter = require('./routes/showQuestionRoutes');

var port = 3000;

app.use(express.static('src'));
app.use('/', postQuestRouter);
app.use(showQuestionRouter);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.get('/', function (req, res) {
  res.send("Hello");
});

app.listen(port, function (err) {
  console.log("Running server on port" + port);
});
