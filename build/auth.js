'use strict';

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _models = require('./models/models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TokenStrategy = require('passport-accesstoken').Strategy;


module.exports = function initializeAuthentication() {
  console.log('conf auth');

  _passport2.default.use(new TokenStrategy(function (token, done) {
    _models.Token.findOne({ value: token }, function (err, user) {
      if (err) {
        console.log(err);
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (!user.verifyToken(token)) {
        return done(null, false);
      }

      return done(null, user);
    });
  }));
};