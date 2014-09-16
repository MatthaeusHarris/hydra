var should = require('should');
var sinon = require('sinon');
var instances = {};
var api = require('../routes/api')(instances);
var repl = require('repl');

describe('api route', function() {
	it ('has the proper attributes', function() {
		api.router.should.be.a.Function;
		api.api_handler.should.be.a.Function;
		api.instances.should.be.an.Object;
		api.instances.should.eql(instances);
	});

	describe ('routes', function() {
		it ('has the proper number of routes', function() {
			api.router.stack.should.have.length(2);
		});

		it ('has the proper endpoints', function() {
			[
				api.router.stack[0].route.path,
				api.router.stack[1].route.path
			].should.containEql('/:service/:version/:path', '/:service/:version');
		});

		it ('each endpoint has the proper methods', function() {
			for (var endpoint in api.router.stack) {
				api.router.stack[endpoint].route.methods.should.have.keys(['post', 'get', 'put', 'delete']);
				// api.router.stack[endpoint].route.stack[0].handle.should.eql(api.api_handler);
			}
		});

		it ('should have the proper handler functions', function() {
			for (var endpoint in api.router.stack) {
				for (var route in api.router.stack[endpoint].route.stack) {
					api.router.stack[endpoint].route.stack[route].handle.should.eql(api.api_handler);
				}
			}
		});	
	});

	describe('api_handler', function() {
		it ('smoke tests', function() {
			(1).should.be.a.Number;
		});
	});
});