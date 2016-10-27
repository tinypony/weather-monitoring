'use strict';

var _models = require('../models/models');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var router = express.Router();

var findFirstBreach = function findFirstBreach(forecast, threshold, direction) {
	return _lodash2.default.find(forecast, function (entry) {
		if (direction === 'larger') {
			return entry.temp > threshold;
		} else if (direction === 'smaller') {
			return entry.temp < threshold;
		}
	});
};

function configureWatch() {
	/* GET watched cities listing with alerts. */
	router.get('/', function _callee2(req, res) {
		var _this = this;

		return regeneratorRuntime.async(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_context2.prev = 0;
						_context2.next = 3;
						return regeneratorRuntime.awrap(function _callee() {
							var user, monitored, cities, monitoredCitiesWithAlerts;
							return regeneratorRuntime.async(function _callee$(_context) {
								while (1) {
									switch (_context.prev = _context.next) {
										case 0:
											_context.next = 2;
											return regeneratorRuntime.awrap(_models.User.findOne().exec());

										case 2:
											user = _context.sent;
											_context.next = 5;
											return regeneratorRuntime.awrap(_models.MonitoringSpec.find({ owner: user._id }));

										case 5:
											monitored = _context.sent;
											_context.next = 8;
											return regeneratorRuntime.awrap(_models.Forecast.find({}).exec());

										case 8:
											cities = _context.sent;
											monitoredCitiesWithAlerts = _lodash2.default.map(monitored, function (monitoringSpec) {
												var latestForecast = _lodash2.default.find(cities, { name: monitoringSpec.name }) || {};
												var firstBreach = findFirstBreach(latestForecast.forecast, monitoringSpec.threshold, monitoringSpec.direction);
												var plainSpec = _lodash2.default.pick(monitoringSpec, '_id', 'name', 'threshold', 'direction', 'owner');

												if (_lodash2.default.isUndefined(firstBreach)) {
													return _lodash2.default.assign({}, plainSpec, { alert: { breached: false } });
												} else {
													return _lodash2.default.assign({}, plainSpec, { alert: {
															breached: true,
															temp: firstBreach.temp,
															time: firstBreach.time,
															timeTxt: new Date(firstBreach.time * 1000)
														} });
												}
											});

											res.status(200).send(monitoredCitiesWithAlerts);

										case 11:
										case 'end':
											return _context.stop();
									}
								}
							}, null, _this);
						}());

					case 3:
						_context2.next = 9;
						break;

					case 5:
						_context2.prev = 5;
						_context2.t0 = _context2['catch'](0);

						console.error(_context2.t0);
						res.status(400).send(_context2.t0);

					case 9:
					case 'end':
						return _context2.stop();
				}
			}
		}, null, this, [[0, 5]]);
	});

	router.delete('/:id', function _callee3(req, res) {
		var id, user;
		return regeneratorRuntime.async(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						id = req.params.id;
						_context3.next = 3;
						return regeneratorRuntime.awrap(_models.User.findOne().exec());

					case 3:
						user = _context3.sent;
						_context3.next = 6;
						return regeneratorRuntime.awrap(_models.MonitoringSpec.findOne({ owner: user._id, _id: id }).remove().exec());

					case 6:
						res.status(200).send();

					case 7:
					case 'end':
						return _context3.stop();
				}
			}
		}, null, this);
	});

	router.post('/', function _callee4(req, res) {
		var user, newSpec, savedSpec;
		return regeneratorRuntime.async(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						_context4.next = 2;
						return regeneratorRuntime.awrap(_models.User.findOne().exec());

					case 2:
						user = _context4.sent;
						//imagine we retrieve the authenticated user rather than the only created one
						newSpec = new _models.MonitoringSpec(_lodash2.default.assign({}, req.body, { owner: user._id }));
						_context4.next = 6;
						return regeneratorRuntime.awrap(newSpec.save());

					case 6:
						savedSpec = _context4.sent;

						res.status(201).send(savedSpec);

					case 8:
					case 'end':
						return _context4.stop();
				}
			}
		}, null, this);
	});

	router.put('/:id', function _callee5(req, res) {
		var id, user, monitoringSpec;
		return regeneratorRuntime.async(function _callee5$(_context5) {
			while (1) {
				switch (_context5.prev = _context5.next) {
					case 0:
						id = req.params.id;
						_context5.next = 3;
						return regeneratorRuntime.awrap(_models.User.findOne().exec());

					case 3:
						user = _context5.sent;
						_context5.next = 6;
						return regeneratorRuntime.awrap(_models.MonitoringSpec.findOneAndUpdate({ _id: id, owner: user._id }, _lodash2.default.omit(req.body, 'owner'), //don't allow to overwrite the owner
						{ new: true }).exec());

					case 6:
						monitoringSpec = _context5.sent;


						res.status(200).send(monitoringSpec);

					case 8:
					case 'end':
						return _context5.stop();
				}
			}
		}, null, this);
	});

	return router;
}

module.exports = configureWatch;