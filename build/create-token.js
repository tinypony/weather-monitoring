'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _models = require('./models/models');

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoose = require('mongoose');


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
}).then(function _callee() {
  var id, token, newToken;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          id = (0, _uuid2.default)();
          token = id.substring(0, 10);
          newToken = new _models.Token({ value: token });
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(newToken.save());

        case 6:
          console.log('New token created: ', token);
          _context.next = 12;
          break;

        case 9:
          _context.prev = 9;
          _context.t0 = _context['catch'](3);

          console.log(_context.t0);

        case 12:
          process.exit();

        case 13:
        case 'end':
          return _context.stop();
      }
    }
  }, null, undefined, [[3, 9]]);
}).catch(function (err) {
  return console.error(err);
});