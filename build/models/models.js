'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.Token = exports.Controller = undefined;

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

var ControllerSchema = new _mongoose.Schema({
	identity: {
		type: String,
		required: [true, 'Identity must be defined and be unique']
	},
	address: {
		type: String,
		required: [true, 'IP address of controller must be definend']
	},
	port: {
		type: Number,
		required: [true, 'Port number of the controller must be specified']
	},
	data: {
		type: _mongoose.Schema.Types.Mixed
	}
});

var TokenSchema = new _mongoose.Schema({
	value: { type: String, required: [true, 'Token value must be provided'] }
});

TokenSchema.methods.verifyToken = function () {
	return true;
};
//
// export const User = mongoose.model('User', UserSchema);
// export const MonitoringSpec = mongoose.model('MonitoringSpec', MonitoringSpecSchema);
// export const Forecast = mongoose.model('Forecast', CityForecastSchema);
var Controller = exports.Controller = _mongoose2.default.model('Controller', ControllerSchema);
var Token = exports.Token = _mongoose2.default.model('Token', TokenSchema);