'use strict';

var express = require('express');
var router = express.Router();

function configureUsers(socketStore) {
	/* GET users listing. */
	router.get('/', function (req, res, next) {
		res.send('respond with a resource\n');
	});

	return router;
}

module.exports = configureUsers;