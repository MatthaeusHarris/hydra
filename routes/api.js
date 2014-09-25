var express = require('express');
var httpProxy = require('http-proxy');

var router = express.Router();
var proxy = httpProxy.createProxy();

var randomInt = require('../lib/random');

module.exports = function(instances) {
	var api_handler = function(req, res) {
		// console.log(req.params);
		// console.log(instances);
		var service = req.params.service;
		var version = req.params.version;
		var path = req.params.path || '';
		var numHosts = 0, targetHost = {}, targetNum = -1, hostKeys = [];
		var possibleHosts = [];
		try {
			if (instances[service]) {
				// console.log(service + ' found');
				if (version == 'HEAD') {
					for (var version in instances[service]) {
						for (var host in instances[service][version]) {
							possibleHosts.push(instances[service][version][host]);
						}
					}
					if (possibleHosts.length > 0) {
						targetNum = randomInt(0, possibleHosts.length);
						targetHost = possibleHosts[targetNum];
					} else {
						throw new Error('service unavailable');
					}
				} else {
					if (instances[service][version]) {
						hostKeys = Object.keys(instances[service][version])
						numHosts = hostKeys.length;
						// console.log(numHosts + ' instances in service');	
						targetNum = randomInt(0, numHosts);
						targetHost = instances[service][version][hostKeys[targetNum]];
						// console.log('Using ' + JSON.stringify(targetHost));

						// console.log(req.url);
						// console.log(path);
					} else {
						throw new Error('service unavailable');
					}
				}
				req.url = '/' + path;
				proxy.web(req, res, {
					target: 'http://' + targetHost['address'] + ':' + targetHost['port']
				});
			} else {
				throw new Error('unknown service');
			}
		} catch(e) {
			// console.log("I don't know that service.");
			console.log(e);
			res.status(503).json({result: e.message});
		}
	}

	router.route('/:service/:version/:path')
		.post(api_handler)
		.get(api_handler)
		.put(api_handler)
		.delete(api_handler);

	router.route('/:service/:version/')
		.post(api_handler)
		.get(api_handler)
		.put(api_handler)
		.delete(api_handler);

	return {
		router: router,
		api_handler: api_handler,
		instances: instances,
		proxy: proxy
	};
};

