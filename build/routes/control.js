'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _express = require('express');

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var _models = require('../models/models');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = (0, _express.Router)();
var unicast_socket = _dgram2.default.createSocket('udp4');

function authenticate(req, res, next) {
	_passport2.default.authenticate('token', function (err, token, info) {
		if (err) {
			return next(err);
		}

		if (!token) {
			return res.status(401).json({ message: "Incorrect token credentials" });
		}
		//    console.log("Auth alright");
		req.user = token;
		next();
	})(req, res, next);
}

/* GET watched cities listing with alerts. */
router.get('/', authenticate, function _callee(req, res) {
	var controllers;
	return regeneratorRuntime.async(function _callee$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					_context.prev = 0;
					_context.next = 3;
					return regeneratorRuntime.awrap(_models.Controller.find({}).exec());

				case 3:
					controllers = _context.sent;
					return _context.abrupt('return', res.status(200).send(controllers));

				case 7:
					_context.prev = 7;
					_context.t0 = _context['catch'](0);

					console.error(_context.t0);
					res.status(400).send(_context.t0);

				case 11:
				case 'end':
					return _context.stop();
			}
		}
	}, null, this, [[0, 7]]);
});

var COMMAND_TYPE_STRING = {
	SET: 'SET',
	ON: 'ON',
	OFF: 'OFF'
};

var COMMAND_TYPE = {
	SET: 0xA0,
	ON: 0xA1,
	OFF: 0xA2
};

var getCommandValueAsByteArray = function getCommandValueAsByteArray(command) {
	if (!command.value || command.value.length !== 6) {
		throw new Error('RGB value not provided');
	}
	var array = [];
	array[0] = parseInt(command.value.substring(0, 2), 16);
	array[1] = parseInt(command.value.substring(2, 4), 16);
	array[2] = parseInt(command.value.substring(4, 6), 16);
	return array;
};

var createPayload = function createPayload(command) {
	var payload = void 0;
	var type = COMMAND_TYPE[command.type];

	if (type === COMMAND_TYPE.SET) {
		var value = getCommandValueAsByteArray(command);
		payload = Buffer.alloc(4);
		payload.writeUInt8(type, 0);
		payload.writeUInt8(value[0], 1);
		payload.writeUInt8(value[1], 2);
		payload.writeUInt8(value[2], 3);
	} else {
		payload = Buffer.alloc(1);
		payload.writeUInt8(type, 0);
	}

	return payload;
};

var sendCommand = function sendCommand(controller, payloadByteArray) {
	console.log('Send command to ' + controller.address + ':' + controller.port);
	unicast_socket.send(new Buffer(payloadByteArray), 0, payloadByteArray.length, controller.port, controller.address, function (err) {
		if (err) {
			console.log(JSON.stringify(err));
		} else {
			console.log('All good');
		}
	});
};

var savePayloadIfProvided = function _callee2(controller, command) {
	return regeneratorRuntime.async(function _callee2$(_context2) {
		while (1) {
			switch (_context2.prev = _context2.next) {
				case 0:
					if (!(command.type === 'SET')) {
						_context2.next = 4;
						break;
					}

					controller.data = getCommandValueAsByteArray(command);
					_context2.next = 4;
					return regeneratorRuntime.awrap(controller.save());

				case 4:
					return _context2.abrupt('return', new Promise(function (resolve) {
						return resolve(controller);
					}));

				case 5:
				case 'end':
					return _context2.stop();
			}
		}
	}, null, undefined);
};

router.put('/:identity', authenticate, function _callee3(req, res) {
	var identity, command, controller;
	return regeneratorRuntime.async(function _callee3$(_context3) {
		while (1) {
			switch (_context3.prev = _context3.next) {
				case 0:
					identity = req.params.identity;
					command = req.body;
					//	console.log('In PUT method');

					if (!(command.type && _lodash2.default.includes(_lodash2.default.keys(COMMAND_TYPE), command.type))) {
						_context3.next = 21;
						break;
					}

					_context3.prev = 3;
					_context3.next = 6;
					return regeneratorRuntime.awrap(_models.Controller.findOne({ identity: identity }).exec());

				case 6:
					controller = _context3.sent;
					_context3.next = 9;
					return regeneratorRuntime.awrap(savePayloadIfProvided(controller, command));

				case 9:
					controller = _context3.sent;

					//			console.log("command saved");
					sendCommand(controller, createPayload(command));
					console.log("command sent to controller");
					res.status(200).send(controller);
					_context3.next = 19;
					break;

				case 15:
					_context3.prev = 15;
					_context3.t0 = _context3['catch'](3);

					console.error(_context3.t0);
					res.status(400).send(_context3.t0);

				case 19:
					_context3.next = 22;
					break;

				case 21:
					res.status(400).send({
						message: 'Command type and value must be defined'
					});

				case 22:
				case 'end':
					return _context3.stop();
			}
		}
	}, null, this, [[3, 15]]);
});

exports.default = router;