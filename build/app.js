'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// load mongoose package
var mongoose = require('mongoose');
var session = require('express-session');
var intializeDb = require('./initialize-db');
var SocketStore = require('./socket-store');
var startPolling = require('./polling');
var routes = require('./routes/index');
var users = require('./routes/users');
var watch = require('./routes/watch');

var app = express();

// Use native Node promises
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/weather-mon').then(function () {
  return console.log('connection succesful');
}).catch(function (err) {
  return console.error(err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'mysecret-yeah',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

var mySocketStore = new SocketStore();

intializeDb().then(function (user) {
  return console.log('User ok ' + user.name);
}).then(startPolling());

app.use('/', routes);
app.use('/users', users(mySocketStore));
app.use('/watch', watch(mySocketStore));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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