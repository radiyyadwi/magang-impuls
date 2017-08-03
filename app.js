const express = require('express');
let app = express();
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').mongoClient;
var postQuestRouter = require('./routes/postQuestRoutes');
var showQuestionRouter = require('./routes/showQuestionRoutes');
var postAnswerRouter = require('./routes/postAnswerRoutes');
var showAnswerRouter = require('./routes/showAnswerRoutes');
var registerRouter = require('./routes/registerRoutes');
var loginRouter = require('./routes/loginRoutes');

var port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('src'));
app.use(postQuestRouter);
app.use(showQuestionRouter);
app.use(postAnswerRouter);
app.use(showAnswerRouter);
app.use(loginRouter);
app.use(registerRouter);
app.get('/', function (req, res) {
  res.send("Hello");
});

app.listen(port, function (err) {
  console.log("Running server on port " + port);
});
