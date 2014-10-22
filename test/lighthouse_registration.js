var should = require('should');
var sinon = require('sinon');
var lighthouse_registration = require('../lib/lighthouse_registration');
var fixtures = {
	eureka_reply: require('./fixtures/eureka_reply.json'),
	eureka_single_reply: require('./fixtures/eureka_single_reply.json')
};

describe('eureka interface', function() {
	it ('has the proper attributes', function() {
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
			beforeEach(function(done) {
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

			it ('removes stale hosts from instances', function() {
				lighthouse_registration.instances.should.have.keys(['sidecar', 'single']);
				// console.log(fixtures.eureka_single_reply.applications.application);
				lighthouse_registration.parse_eureka_reply(fixtures.eureka_single_reply, {statusCode: 200});
				// console.log(lighthouse_registration.instances);
				// console.log(Object.keys(lighthouse_registration.instances));
				Object.keys(lighthouse_registration.instances).should.have.length(0);
			});
		});

		it ('parses a single service eureka service object with no valid services', function() {
			lighthouse_registration.parse_eureka_reply(fixtures.eureka_single_reply, {statusCode: 200});
			var instances = lighthouse_registration.instances;
			Object.keys(instances).should.have.length(0);
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
			beforeEach(function(done) {
				checkin_stub = sinon.stub(lighthouse_registration, 'checkin');
				clock = sinon.useFakeTimers();
				lighthouse_registration.initialize(instances, options);
				done();
			});

			afterEach(function(done) {
				lighthouse_registration.checkin.restore();
				clock.restore();
				done();
			});

			it ('sets up the interval', function() {
				clock.tick(options.registration_interval);
				checkin_stub.called.should.be.true;
			});
		});


		beforeEach(function(done) {
			// post_stub = sinon.stub(lighthouse_registration.client, 'post');
			get_stub = sinon.stub(lighthouse_registration.client, 'get');
			clock = sinon.useFakeTimers();
			done();
		});

		afterEach(function(done) {
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