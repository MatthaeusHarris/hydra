var express = require('express');
var router = express.Router();

module.exports = function(instances) {
	router.route('/instances')
		.get(function(req, res) {
			console.log(req);
			res.json(instances);
		});

	router.route('/instances/:service')
		.get(function(req, res) {
			res.json(instances[req.params.service]);
		});

	return router;
};