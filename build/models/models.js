'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Forecast = exports.MonitoringSpec = exports.User = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MonitoringSpecSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Specify city name']
  },
  threshold: {
    type: Number,
    required: [true, 'Specify threshold']
  },
  direction: {
    type: String,
    required: [true, 'Specify "larger" or "smaller"']
  },
  owner: {
    type: _mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

var CityForecastSchema = new _mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Specify city name']
  },
  forecast: {
    type: [{
      time: Number,
      temp: Number
    }],
    default: []
  }
});

var UserSchema = new _mongoose.Schema({
  id: String,
  name: String
});

var User = exports.User = _mongoose2.default.model('User', UserSchema);
var MonitoringSpec = exports.MonitoringSpec = _mongoose2.default.model('MonitoringSpec', MonitoringSpecSchema);
var Forecast = exports.Forecast = _mongoose2.default.model('Forecast', CityForecastSchema);