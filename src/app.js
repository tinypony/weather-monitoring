var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
import fs from 'fs';
// load mongoose package
const mongoose = require('mongoose');
const session = require('express-session');
const intializeDb = require('./initialize-db');
const startPolling = require('./polling');
const routes = require('./routes/index');
const users = require('./routes/users');
const watch = require('./routes/watch');

const app = express();



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

function readJsonFileSync(filepath, encoding){

    if (typeof (encoding) == 'undefined'){
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

function getConfig(file) {
    var filepath = __dirname + '/../' + file;
    return readJsonFileSync(filepath);
}

const configuration = getConfig('config.json');

// Use native Node promises
mongoose.Promise = global.Promise;
mongoose.connect(configuration.database)
  .then(() =>  console.log('connection succesful'))
  .catch(err => console.error(err));


intializeDb()
  .then(user => console.log('User ok ' + user.name))
  .then(startPolling(configuration.openweathermap.apiKey, configuration.openweathermap.checkInterval))


app.use('/', routes);
app.use('/users', users());
app.use('/watch', watch());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});


module.exports = app;
