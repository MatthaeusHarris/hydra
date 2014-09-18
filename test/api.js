var should = require('should');
var sinon = require('sinon');
var instances = {};
var api = require('../routes/api')(instances);

describe('api route', function() {
	it ('has the proper attributes', function() {
		api.router.should.be.a.Function;
		api.api_handler.should.be.a.Function;
		api.instances.should.be.an.Object;
		api.instances.should.eql(instances);
		api.proxy.should.be.an.Object;
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
		var proxy_stub;
		var res_spy, req_spy;
		var res_stub;
		var req_mock;
		var req;

		beforeEach(function(done) {
			proxy_stub = sinon.stub(api.proxy, 'web');
			res_spy = sinon.spy();
			req_spy = sinon.spy();
			req = {
				params: {
					service: 'dummyservice',
					version: '0.0.1',
					path: 'endpoint/path'
				},
				url: '/dummyservice/0.0.1/endpoint/path'
			};

			res_stub = {
				status: sinon.stub(),
				json: sinon.stub()
			};

			res_stub.status.returns(res_stub);
			res_stub.json.returns(res_stub);
			done();
		});

		afterEach(function(done) {
			proxy_stub.restore();
			done();
		});

		it ('smoke tests', function() {
			res_stub.status.called.should.be.false;
			api.api_handler(req, res_stub);
			res_stub.status.called.should.be.true;
			res_stub.json.called.should.be.true;
		});

		describe ('service found, version not found', function() {
			var instances, api;
			beforeEach(function(done) {
				instances = {
					dummyservice: {
						'0.0.2': {
							host1: {
								hostname: "host1",
								port: 5000,
								version: "0.0.1",
								timestamp: "Mon Sep 15 2014 16:02:43 GMT-0700",
								address: "127.0.0.1"
							}
						}
					}
				};
				api = require('../routes/api')(instances);
				done();
			});

			it ('returns a 503', function() {
				api.api_handler(req, res_stub);
				res_stub.status.calledWith(503);
				res_stub.json.calledWith({result: 'service unavailable'}).should.be.true;
			});
		});

		describe ('service found, version found', function() {
			var instances, api;
			beforeEach(function(done) {
				instances = {
					dummyservice: {
						'0.0.1': {
							host1: {
								hostname: "host1",
								port: 5000,
								version: "0.0.1",
								timestamp: "Mon Sep 15 2014 16:02:43 GMT-0700",
								address: "127.0.0.1"
							}
						}
					}
				};
				api = require('../routes/api')(instances);
				done();
			});

			it ('forwards the request', function() {

				api.api_handler(req, res_stub);
				proxy_stub.calledWith(req, res_stub, {target: 'http://127.0.0.1:5000'}).should.be.true;
			});
		});

		describe ('service found, version found, no path provided', function() {
			beforeEach(function(done) {
				instances = {
					dummyservice: {
						'0.0.1': {
							host1: {
								hostname: "host1",
								port: 5000,
								version: "0.0.1",
								timestamp: "Mon Sep 15 2014 16:02:43 GMT-0700",
								address: "127.0.0.1"
							}
						}
					}
				};
				api = require('../routes/api')(instances);
				req.params.path = null;
				req.url = '/dummyservice/0.0.1';
				done();
			});

			it ('provides a default path and makes the call anyway', function() {
				proxy_stub.calledWith(req, res_stub, {target: 'http://127.0.0.1:5000'}).should.be.false;
				api.api_handler(req, res_stub);
				req.url.should.eql('/');
				proxy_stub.calledWith(req, res_stub, {target: 'http://127.0.0.1:5000'}).should.be.true;
			});
		});
	});
});