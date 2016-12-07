'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _control = require('./routes/control');

var _control2 = _interopRequireDefault(_control);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// load mongoose package
var mongoose = require('mongoose');
var session = require('express-session');
var initializeDb = require('./initialize-db');
var initAuth = require('./auth');
var initializeUdpServer = require('./broadcast-listener');

var startPolling = require('./polling');
var routes = require('./routes/index');
var users = require('./routes/users');
var watch = require('./routes/watch');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(session({
//   secret: 'mysecret-yeah',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false }
// }));
app.use(_passport2.default.initialize());
app.set('view engine', 'jade');

function readJsonFileSync(filepath, encoding) {
  if (typeof encoding == 'undefined') {
    encoding = 'utf8';
  }
  var file = _fs2.default.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function getConfig(file) {
  var filepath = __dirname + '/../' + file;
  return readJsonFileSync(filepath);
}

var configuration = getConfig('config.json');

// Use native Node promises
mongoose.Promise = global.Promise;
mongoose.connect(configuration.database).then(function () {
  return console.log('connection succesful');
}).then(function () {
  return initializeDb();
}).then(function () {
  return initAuth();
}).catch(function (err) {
  return console.error(err);
});

initializeUdpServer(6543);

app.use('/', routes);
// app.use('/users', users());
// app.use('/watch', watch());
app.use('/controllers', _control2.default);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

module.exports = app;