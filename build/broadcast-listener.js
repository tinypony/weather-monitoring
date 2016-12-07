'use strict';

var _dgram = require('dgram');

var _dgram2 = _interopRequireDefault(_dgram);

var _models = require('./models/models');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function initializeUdpServer(broadcastPort) {
  var _this = this;

  var broadcast_socket = _dgram2.default.createSocket('udp4');

  broadcast_socket.on('message', function _callee(data, rinfo) {
    var dataString, chunks, identity, controllerPort, controllerAddress;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            dataString = data.toString();
            chunks = dataString.split(',');
            identity = chunks[0].split('=')[1];
            controllerPort = chunks[1].split('=')[1];
            controllerAddress = rinfo.address;
            //console.log(`Got broadcast update from ${controllerAddress}:${controllerPort} = ${identity}`);

            _context.prev = 5;
            _context.next = 8;
            return regeneratorRuntime.awrap(_models.Controller.findOneAndUpdate({ identity: identity }, { identity: identity, address: controllerAddress, port: controllerPort }, { upsert: true }).exec());

          case 8:
            return _context.abrupt('return');

          case 11:
            _context.prev = 11;
            _context.t0 = _context['catch'](5);

            console.error('Problem ' + JSON.stringify(_context.t0));

          case 14:
          case 'end':
            return _context.stop();
        }
      }
    }, null, _this, [[5, 11]]);
  });

  broadcast_socket.bind(broadcastPort, '0.0.0.0');
};