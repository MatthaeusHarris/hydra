var express = require('express');
var router = express.Router();

module.exports = function(instances) {
	/* GET home page. */
	router.get('/', function(req, res) {
	  res.render('index', { title: 'Hydra', instances: instances });
	});

	return router;
};
