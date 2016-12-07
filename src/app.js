var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
import fs from 'fs';
// load mongoose package
const mongoose = require('mongoose');
const session = require('express-session');
const initializeDb = require('./initialize-db');
const initAuth = require('./auth');
const initializeUdpServer = require('./broadcast-listener');

const startPolling = require('./polling');
const routes = require('./routes/index');
const users = require('./routes/users');
const watch = require('./routes/watch');
import passport from 'passport';
import controllersRouter from './routes/control';
const app = express();

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
app.use(passport.initialize());
app.set('view engine', 'jade');

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
  .then(() => initializeDb())
  .then(() => initAuth())
  .catch(err => console.error(err));

initializeUdpServer(6543);

app.use('/', routes);
// app.use('/users', users());
// app.use('/watch', watch());
app.use('/controllers', controllersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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
