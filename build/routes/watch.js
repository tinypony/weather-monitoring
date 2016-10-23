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
							var user, cities, monitoredCitiesWithAlerts;
							return regeneratorRuntime.async(function _callee$(_context) {
								while (1) {
									switch (_context.prev = _context.next) {
										case 0:
											_context.next = 2;
											return regeneratorRuntime.awrap(_models.User.findOne().exec());

										case 2:
											user = _context.sent;
											_context.next = 5;
											return regeneratorRuntime.awrap(_models.City.find({}).exec());

										case 5:
											cities = _context.sent;
											monitoredCitiesWithAlerts = _lodash2.default.map(user.monitored, function (monitoringSpec) {
												var latestForecast = _lodash2.default.find(cities, { name: monitoringSpec.name });
												var firstBreach = findFirstBreach(latestForecast.forecast, monitoringSpec.threshold, monitoringSpec.direction);
												var plainSpec = _lodash2.default.pick(monitoringSpec, 'name', 'threshold', 'direction');

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

										case 8:
										case 'end':
											return _context.stop();
									}
								}
							}, null, _this);
						}());

					case 3:
						_context2.next = 8;
						break;

					case 5:
						_context2.prev = 5;
						_context2.t0 = _context2['catch'](0);

						res.status(400).send(_context2.t0);

					case 8:
					case 'end':
						return _context2.stop();
				}
			}
		}, null, this, [[0, 5]]);
	});

	router.delete('/:cityName', function _callee3(req, res) {
		var cityNameToDelete, user, existingEntry, idx;
		return regeneratorRuntime.async(function _callee3$(_context3) {
			while (1) {
				switch (_context3.prev = _context3.next) {
					case 0:
						cityNameToDelete = req.params.cityName;
						_context3.next = 3;
						return regeneratorRuntime.awrap(_models.User.findOne().exec());

					case 3:
						user = _context3.sent;
						existingEntry = _lodash2.default.find(user.monitored, { name: cityNameToDelete });

						// A new city is being added

						if (_lodash2.default.isUndefined(existingEntry)) {
							_context3.next = 13;
							break;
						}

						idx = _lodash2.default.indexOf(user.monitored, existingEntry);

						user.monitored.splice(idx, 1);
						_context3.next = 10;
						return regeneratorRuntime.awrap(user.save());

					case 10:
						res.status(200).send();
						_context3.next = 14;
						break;

					case 13:
						res.status(404).send({
							message: 'City is not monitored'
						});

					case 14:
					case 'end':
						return _context3.stop();
				}
			}
		}, null, this);
	});

	router.post('/', function _callee4(req, res) {
		var user, newCity, existingEntry, cityForecast, idx;
		return regeneratorRuntime.async(function _callee4$(_context4) {
			while (1) {
				switch (_context4.prev = _context4.next) {
					case 0:
						_context4.next = 2;
						return regeneratorRuntime.awrap(_models.User.findOne().exec());

					case 2:
						user = _context4.sent;
						newCity = req.body;
						existingEntry = _lodash2.default.find(user.monitored, { name: newCity.name });
						// A new city is being added

						if (!_lodash2.default.isUndefined(existingEntry)) {
							_context4.next = 12;
							break;
						}

						user.monitored.push(newCity);
						cityForecast = new _models.City({ name: newCity.name });
						_context4.next = 10;
						return regeneratorRuntime.awrap(cityForecast.save());

					case 10:
						_context4.next = 14;
						break;

					case 12:
						idx = _lodash2.default.indexOf(user.monitored, existingEntry);
						// Replace existing city at index

						user.monitored.splice(idx, 1, newCity);

					case 14:
						_context4.next = 16;
						return regeneratorRuntime.awrap(user.save());

					case 16:
						res.status(200).send();

					case 17:
					case 'end':
						return _context4.stop();
				}
			}
		}, null, this);
	});

	return router;
}

module.exports = configureWatch;