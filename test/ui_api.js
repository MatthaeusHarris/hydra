var should = require('should');
var sinon = require('sinon');
var instances = require('./fixtures/eureka_parsed.json');
var api = require('../routes/ui_api');

ui_api = api(instances);

describe ('ui_api route', function() {
	beforeEach(function(done){
		done();
	});

	it ('has the proper attributes', function() {
		ui_api.should.be.a.Function;
	});

	describe('actual endpoints', function() {
		var res_stub;
		var req;
		beforeEach(function(done) {
			res_stub =  {
				json: sinon.stub()
			};
			done();
		});

		it ('responds to /instances', function() {
			for (var stack in ui_api.stack) {
				if (ui_api.stack[stack].route.path == '/instances') {
					req = {
						url: '/instances',
						method: 'GET'
					};
					res_stub.json.calledWith(instances).should.be.false;
					ui_api.stack[stack].handle(req, res_stub);
					res_stub.json.calledWith(instances).should.be.true;
				}
			}
		});

		it ('responds to /instances/:service', function() {
			for (var stack in ui_api.stack) {
				if (ui_api.stack[stack].route.path == '/instances/:service') {
					req = {
						params: {
							service: 'eureka'
						},
						url: '/instances/eureka',
						method: 'GET'
					};
					res_stub.json.calledWith(instances.eureka).should.be.false;
					ui_api.stack[stack].handle(req, res_stub);
					res_stub.json.calledWith(instances.eureka).should.be.true;
				}
			}
		});
	});
});