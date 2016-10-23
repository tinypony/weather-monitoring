var mongoose = require('mongoose');
var User = require('./models/models.js').User;

function SocketStore() {
	this.sockets = {};
}

SocketStore.prototype.checkAll = function(city) {

};

SocketStore.prototype.checkUser = function(userName, city) {

};

SocketStore.prototype.saveWebsocket = function(userName, sock) {
	this.sockets[userName] = sock;
}

SocketStore.prototype.removeWebsocket = function(userName) {
	delete this.sockets[userName];
};

module.exports = SocketStore;