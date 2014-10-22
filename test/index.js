var should = require('should');
var sinon = require('sinon');
var instances = require('./fixtures/eureka_parsed.json');
var api = require('../routes/index');

index_api = api(instances);

describe  ('index route', function() {
	it ('has the proper attributes', function() {
		index_api.should.be.a.Function;
	});

	describe ('actual endpoints', function() {
		var res_stub, req;

		before(function(done) {
			res_stub = {
				render: sinon.stub()
			};
			done();
		});

		it ('responds to the / endpoint', function() {
			req = {
				url: '/',
				method: 'GET'
			};
			index_api.stack[0].route.path.should.eql('/');

			res_stub.render.calledWith('index', { title: 'Hydra', instances: instances }).should.be.false;
			index_api.stack[0].handle(req, res_stub);
			res_stub.render.calledWith('index', { title: 'Hydra', instances: instances }).should.be.true;
		});
	});
});