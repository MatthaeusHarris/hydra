var should = require('should');
var sinon = require('sinon');
var random = require('../lib/random');

describe ('random number utility function', function() {
	it ('generates a number between min and max', function() {
		var n = random(1,10);
		n.should.be.within(1,10);
	});
});