'use strict';

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _models = require('./models//models');

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _babelPolyfill = require('babel-polyfill');

var _babelPolyfill2 = _interopRequireDefault(_babelPolyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var processData = function processData(data) {
	return {
		name: data.city.name,
		forecast: _lodash2.default.map(data.list, function (entry) {
			return { time: entry.dt, temp: entry.main.temp };
		})
	};
};

function delay(timeout) {
	return new Promise(function (resolve) {
		return setTimeout(resolve, timeout);
	});
}

var getUrlForCity = function getUrlForCity(name, apiKey) {
	return 'http://api.openweathermap.org/data/2.5/forecast?q=' + name + '&units=metric&APPID=' + apiKey;
};

/**
 * Function for checking weather forecast for the specified city
 *
 * @param {String} name - the name of the city.
 * @returns {Promise} - a promise that is resolved with json response from http://api.openweathermap.org/data/2.5/forecast.
 */
function checkCity(name, apiKey) {
	return new Promise(function (resolve, reject) {
		//Create http request to openweathermap
		var request = _http2.default.get(getUrlForCity(name, apiKey), function (response) {
			//reject promise if received status code other than 200
			if (response.statusCode !== 200) {
				reject(new Error('Failed to check weather for ' + name + ': ' + request.statusCode));
			} else {
				(function () {
					//read body and parse json object from it.
					var body = [];
					response.on('data', function (chunk) {
						return body.push(chunk);
					});
					response.on('end', function () {
						try {
							var bodyStr = body.join('');
							var jsonResponse = JSON.parse(bodyStr);
							resolve(jsonResponse);
						} catch (err) {
							console.console.error(err);
							reject(err);
						}
					});
				})();
			}
		});

		request.on('error', function (err) {
			return reject(err);
		});
	});
};

//Async function that reads all cities in the system and checks forecast for each of them
function checkConfiguredCities(apiKey, checkInterval) {
	var cities, i, name, jsonResponse, _processData, forecast;

	return regeneratorRuntime.async(function checkConfiguredCities$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					_context.prev = 0;
					_context.next = 3;
					return regeneratorRuntime.awrap(_models.MonitoringSpec.find({}).exec());

				case 3:
					cities = _context.sent;

					if (!(cities.length === 0)) {
						_context.next = 9;
						break;
					}

					_context.next = 7;
					return regeneratorRuntime.awrap(delay(checkInterval));

				case 7:
					_context.next = 24;
					break;

				case 9:
					i = 0;

				case 10:
					if (!(i < cities.length)) {
						_context.next = 24;
						break;
					}

					name = cities[i].name;
					_context.next = 14;
					return regeneratorRuntime.awrap(checkCity(name, apiKey));

				case 14:
					jsonResponse = _context.sent;
					_processData = processData(jsonResponse), forecast = _processData.forecast;
					_context.next = 18;
					return regeneratorRuntime.awrap(_models.Forecast.findOneAndUpdate({ name: name }, { name: name, forecast: forecast }, { upsert: true }).exec());

				case 18:
					console.log('Checked: ' + name);
					_context.next = 21;
					return regeneratorRuntime.awrap(delay(checkInterval));

				case 21:
					i++;
					_context.next = 10;
					break;

				case 24:
					_context.next = 31;
					break;

				case 26:
					_context.prev = 26;
					_context.t0 = _context['catch'](0);

					console.log(_context.t0);
					_context.next = 31;
					return regeneratorRuntime.awrap(delay(checkInterval));

				case 31:
					return _context.abrupt('return', new Promise(function (resolve) {
						return resolve();
					}));

				case 32:
				case 'end':
					return _context.stop();
			}
		}
	}, null, this, [[0, 26]]);
}

function setupWeatherPolling(apiKey, checkInterval) {
	var checkTimeout = void 0;

	function runCheck(apiKey, checkInterval) {
		var result;
		return regeneratorRuntime.async(function runCheck$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						_context2.next = 2;
						return regeneratorRuntime.awrap(checkConfiguredCities(apiKey, checkInterval));

					case 2:
						result = _context2.sent;

						setTimeout(runCheck.bind(null, apiKey, checkInterval), checkInterval);

					case 4:
					case 'end':
						return _context2.stop();
				}
			}
		}, null, this);
	};

	runCheck(apiKey, checkInterval);
}

module.exports = setupWeatherPolling;