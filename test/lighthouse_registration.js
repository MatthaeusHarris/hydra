var should = require('should');
var sinon = require('sinon');
var lighthouse_registration = require('../lib/lighthouse_registration');
var fixtures = {
	eureka_reply: require('./fixtures/eureka_reply.json')
};

describe('lighthouse registration', function() {
	it ('basic unit tests', function() {
		lighthouse_registration.should.be.an.Object;
		lighthouse_registration.client.should.be.an.Object;
		lighthouse_registration.instances.should.be.an.Object;
		lighthouse_registration.options.should.be.an.Object;
		lighthouse_registration.register_args.should.be.an.Object;
		lighthouse_registration.initialize.should.be.a.Function;
		lighthouse_registration.checkin.should.be.a.Function;
		lighthouse_registration.checkin_interval.should.be.an.Object;
		lighthouse_registration.parse_eureka_reply.should.be.a.Function;
	});

	describe('eureka reply parsing', function() {
		describe('positive tests', function() {
			var instances = {};
			before(function(done) {
				lighthouse_registration.parse_eureka_reply(fixtures.eureka_reply, {statusCode: 200});	
				instances = lighthouse_registration.instances;
				done();
			});

			it ('parses an outer eureka reply object', function() {
				instances.should.have.keys(['sidecar', 'single']);
			});

			it ('skips services that do not have version info', function() {
				instances.should.not.have.keys('eureka');
			});

			it ('parses a single instance eureka service object', function() {
				instances.single.should.be.an.Object;
				instances.single.should.have.keys('0.0.1');
				Object.keys(instances.single['0.0.1']).should.have.length(1);
				instances.single['0.0.1']['single-hostname'].should.have.properties([
					'hostname', 'port', 'version', 'timestamp', 'address']);
			});

			it ('parses a plural instance eureka service object', function() {
				instances.sidecar.should.be.an.Object;
				instances.sidecar.should.have.keys('0.0.1');
				Object.keys(instances.sidecar['0.0.1']).should.have.length(2);
				for (var instance in instances.sidecar['0.0.1']) {
					instances.sidecar['0.0.1'][instance].should.have.properties([
						'hostname', 'port', 'version', 'timestamp', 'address']);
				}
			});
		});

		it ('throws an error when it encounters an HTTP error', function() {
			(function() {
				lighthouse_registration.parse_eureka_reply("Fail", {statusCode: 503});
			}).should.throw('Fail');
		});
	});

	describe ('initializes with defaults', function() {
		var instances = {};
		var options = {};
		var defaults = {
			registration_interval: lighthouse_registration.options.registration_interval,
			registration_url: lighthouse_registration.options.registration_url
		};

		it ('initializes with single argument', function() {
			lighthouse_registration.initialize(instances);
			lighthouse_registration.options.registration_interval.should.eql(defaults.registration_interval);
			lighthouse_registration.options.registration_url.should.eql(defaults.registration_url);
			lighthouse_registration.instances.should.equal(instances);
		});

		it ('initializes with empty options argument', function() {
			lighthouse_registration.initialize(instances, {});
			lighthouse_registration.options.registration_interval.should.eql(defaults.registration_interval);
			lighthouse_registration.options.registration_url.should.eql(defaults.registration_url);
			lighthouse_registration.instances.should.equal(instances);
		});
	});

	describe ('initializes and runs properly', function() {
		var instances = {};
		var options = {
			registration_interval: 10000,
			registration_url: 'http://localhost:8080/api/instances'
		};

		before(function(done) {
			lighthouse_registration.initialize(instances, options);
			done();
		});

		it('uses arguments properly', function() {
			lighthouse_registration.instances.should.equal(instances)
			lighthouse_registration.options.registration_interval.should.eql(options.registration_interval);
			lighthouse_registration.options.registration_url.should.eql(options.registration_url);
		});
	});

	describe('functional tests', function() {
		var instances = {};
		var options = {
			registration_interval: 10000,
			registration_url: 'http://localhost:8080/api/instances'
		};

		// var post_stub;
		var get_stub;
		var checkin_stub;
		var clock;

		describe ('timer tests', function() {
			before(function(done) {
				checkin_stub = sinon.stub(lighthouse_registration, 'checkin');
				clock = sinon.useFakeTimers();
				lighthouse_registration.initialize(instances, options);
				done();
			});

			after(function(done) {
				lighthouse_registration.checkin.restore();
				clock.restore();
				done();
			});

			it ('sets up the interval', function() {
				clock.tick(options.registration_interval);
				checkin_stub.called.should.be.true;
			});
		});


		before(function(done) {
			// post_stub = sinon.stub(lighthouse_registration.client, 'post');
			get_stub = sinon.stub(lighthouse_registration.client, 'get');
			clock = sinon.useFakeTimers();
			done();
		});

		after(function(done) {
			// lighthouse_registration.client.post.restore();
			lighthouse_registration.client.get.restore();
			clock.restore();
			done();
		});

		it ('makes the proper REST calls', function() {
			// post_stub.callsArgWith(2, null, {statusCode: 200});
			get_stub.callsArgWith(2, fixtures.eureka_reply, {statusCode: 200});

			lighthouse_registration.initialize(instances, options);
			clock.tick(options.registration_interval);

			// post_stub.called.should.be.true;
			get_stub.called.should.be.true;
		});
	});
});