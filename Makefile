test: .FORCE
	istanbul cover node_modules/.bin/_mocha
	istanbul report clover
	istanbul report cobertura

.FORCE: