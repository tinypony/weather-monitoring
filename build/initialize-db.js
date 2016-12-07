'use strict';

var _models = require('./models/models');

module.exports = function _callee() {
	return regeneratorRuntime.async(function _callee$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					_context.prev = 0;
					_context.next = 3;
					return regeneratorRuntime.awrap(_models.Controller.findOneAndUpdate({ identity: 'bed-light' }, { identity: 'bed-light', address: '192.168.1.9', port: 3456, data: [0x99, 0x99, 0x99] }, { upsert: true }).exec());

				case 3:
					return _context.abrupt('return');

				case 6:
					_context.prev = 6;
					_context.t0 = _context['catch'](0);

					console.error('Problem initialzing database ' + JSON.stringify(_context.t0));

				case 9:
				case 'end':
					return _context.stop();
			}
		}
	}, null, this, [[0, 6]]);
};