import passport from 'passport';
const TokenStrategy = require('passport-accesstoken').Strategy;
import {Token} from './models/models';

module.exports = function initializeAuthentication() {
  console.log('conf auth');

  passport.use(new TokenStrategy(
    function (token, done) {
      Token.findOne({value: token}, function (err, user) {
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
    }
  ));
}
