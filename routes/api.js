var express = require('express');
var httpProxy = require('http-proxy');

var router = express.Router();
var proxy = httpProxy.createProxy();

var randomInt = function(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

module.exports = function(instances) {
	var api_handler = function(req, res) {
		console.log(req.params);
		console.log(instances);
		var service = req.params.service;
		var version = req.params.version;
		var path = req.params.path;
		var numHosts = 0, targetHost = {}, targetNum = -1, hostKeys = [];
		if (instances[service]) {
			console.log(service + ' found');
			if (instances[service][version]) {
				hostKeys = Object.keys(instances[service][version])
				numHosts = hostKeys.length;
				console.log(numHosts + ' instances in service');	
				targetNum = randomInt(0, numHosts);
				targetHost = instances[service][version][hostKeys[targetNum]];
				console.log('Using ' + JSON.stringify(targetHost));

				console.log(req.url);
				console.log(path);
				req.url = '/' + path;
				proxy.web(req, res, {
					target: 'http://' + targetHost['address'] + ':' + targetHost['port']
				});

			} else {
				res.status(503).json({result: 'service unavailable'});
			}
		} else {
			res.status(503).json({result: 'unknown service'});
		}
	}

	router.route('/:service/:version/:path')
		.post(api_handler)
		.get(api_handler)
		.put(api_handler)
		.delete(api_handler);

	return router;
};

